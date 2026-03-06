import React, { useEffect } from "react";
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Alert, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { usePropertyStore } from "../state/propertyStore";
import { useUserStore } from "../state/userStore";
import { fetchPropertiesFromSupabase } from "../api/realtyService";
import { fetchPropertiesFromGoogleSheets } from "../api/googleSheetsService";
import { mockProperties } from "../api/mockData";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { PropertyCard } from "../components/PropertyCard";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PropertiesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const profile = useUserStore((state) => state.profile);
  const {
    filteredProperties,
    properties,
    setProperties,
    toggleFavorite,
    isFavorite,
    preferences,
    saveFavoriteToDatabase,
    syncFavoritesFromDatabase,
  } = usePropertyStore();

  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500 });
    contentOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const loadProperties = async () => {
    try {
      try {
        const props = await fetchPropertiesFromSupabase();
        if (props.length > 0) {
          setProperties(props);
          return;
        }
      } catch (supabaseError) {
        console.warn("Supabase nedostupny:", supabaseError);
      }
      const props = await fetchPropertiesFromGoogleSheets();
      if (props.length > 0) {
        setProperties(props);
      } else {
        setProperties(mockProperties);
      }
    } catch (error) {
      setProperties(mockProperties);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
    if (profile?.id) {
      syncFavoritesFromDatabase(profile.id);
    }
  }, [profile?.id]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadProperties();
    setRefreshing(false);
  }, []);

  const handlePropertyPress = (property: typeof filteredProperties[0]) => {
    navigation.navigate("PropertyDetail", { property });
  };

  const handleToggleFavorite = async (propertyId: string) => {
    const wasFavorite = isFavorite(propertyId);
    toggleFavorite(propertyId);
    if (profile?.id) {
      try {
        await saveFavoriteToDatabase(profile.id, propertyId, !wasFavorite);
      } catch (error) {
        toggleFavorite(propertyId);
        Alert.alert("Chyba", "Nepodařilo se uložit oblíbenou nemovitost.");
      }
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' }}>
        <LinearGradient
          colors={['rgba(99,102,241,0.3)', 'rgba(59,130,246,0.3)']}
          style={{
            width: 80, height: 80, borderRadius: 24,
            alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          }}
        >
          <ActivityIndicator size="large" color="#818cf8" />
        </LinearGradient>
        <Text style={{ color: '#9ca3af', fontSize: 16, fontWeight: '500' }}>
          Načítám nemovitosti...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
          />
        }
      >
        {/* Header Stats */}
        <Animated.View style={headerStyle}>
          <LinearGradient
            colors={['#1a1040', '#0A0A0F']}
            style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: '#6b7280', fontSize: 13, fontWeight: '600', letterSpacing: 1, marginBottom: 6 }}>
                  NALEZENO NABIDEK
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={{ fontSize: 52, fontWeight: '800', color: '#ffffff', letterSpacing: -2, lineHeight: 56 }}>
                    {filteredProperties.length}
                  </Text>
                  <Text style={{ color: '#6b7280', fontSize: 16, marginLeft: 6, marginBottom: 8 }}>
                    / {properties.length}
                  </Text>
                </View>
                {preferences.locations.length > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Ionicons name="location" size={13} color="#6366f1" />
                    <Text style={{ color: '#6366f1', fontSize: 13, marginLeft: 4, fontWeight: '600' }} numberOfLines={1}>
                      {preferences.locations.join(", ")}
                    </Text>
                  </View>
                )}
              </View>

              {/* Filter info chip */}
              <View style={{
                backgroundColor: 'rgba(99,102,241,0.15)',
                borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
                borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)',
                alignItems: 'center',
              }}>
                <Ionicons name="trending-down" size={18} color="#818cf8" />
                <Text style={{ color: '#818cf8', fontSize: 13, fontWeight: '700', marginTop: 4 }}>
                  -{preferences.minDiscountPercentage}%
                </Text>
                <Text style={{ color: '#6b7280', fontSize: 11 }}>min. sleva</Text>
              </View>
            </View>

            {/* Price filter */}
            <View style={{
              marginTop: 16,
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
              flexDirection: 'row', alignItems: 'center',
            }}>
              <Ionicons name="cash-outline" size={16} color="#6b7280" style={{ marginRight: 8 }} />
              <Text style={{ color: '#9ca3af', fontSize: 13 }}>
                Cena: {(preferences.priceRange.min / 1_000_000).toFixed(1)}M – {(preferences.priceRange.max / 1_000_000).toFixed(1)}M Kč
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Properties List */}
        <Animated.View style={contentStyle}>
          {filteredProperties.length === 0 ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 40 }}>
              <View style={{
                width: 100, height: 100, borderRadius: 30,
                backgroundColor: 'rgba(99,102,241,0.1)',
                alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)',
              }}>
                <Ionicons name="home-outline" size={48} color="#374151" />
              </View>
              <Text style={{ fontSize: 22, fontWeight: '700', color: '#ffffff', textAlign: 'center', marginBottom: 10 }}>
                Žádné nabídky
              </Text>
              <Text style={{ color: '#6b7280', textAlign: 'center', lineHeight: 22 }}>
                Zkuste upravit vaše kritéria v záložce Kritéria
              </Text>
            </View>
          ) : (
            <View style={{ paddingTop: 8, paddingBottom: 20 }}>
              {filteredProperties.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onPress={() => handlePropertyPress(property)}
                  onFavoritePress={() => handleToggleFavorite(property.id)}
                  isFavorite={isFavorite(property.id)}
                  index={index}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
