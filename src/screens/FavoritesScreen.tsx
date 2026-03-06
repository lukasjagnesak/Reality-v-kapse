import React, { useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { usePropertyStore } from "../state/propertyStore";
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

export default function FavoritesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { properties, favoriteIds, toggleFavorite } = usePropertyStore();
  const favoriteProperties = properties.filter((p) => favoriteIds.includes(p.id));

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    translateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handlePropertyPress = (property: typeof favoriteProperties[0]) => {
    navigation.navigate("PropertyDetail", { property });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#1a1040', '#0A0A0F']}
          style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{
              backgroundColor: 'rgba(239,68,68,0.15)',
              borderRadius: 10, padding: 8, marginRight: 12,
              borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
            }}>
              <Ionicons name="heart" size={20} color="#ef4444" />
            </View>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5 }}>
              Oblíbené
            </Text>
          </View>
          <Text style={{ color: '#6b7280', fontSize: 14 }}>
            {favoriteProperties.length > 0
              ? `${favoriteProperties.length} uloženích nemovitostí`
              : 'Zatím žádné oblíbené'}
          </Text>
        </LinearGradient>

        <Animated.View style={animStyle}>
          {favoriteProperties.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 80, paddingHorizontal: 40 }}>
              <View style={{
                width: 110, height: 110, borderRadius: 32,
                backgroundColor: 'rgba(239,68,68,0.08)',
                alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)',
              }}>
                <Ionicons name="heart-outline" size={52} color="#374151" />
              </View>
              <Text style={{ fontSize: 22, fontWeight: '700', color: '#ffffff', textAlign: 'center', marginBottom: 12 }}>
                Žádné oblíbené
              </Text>
              <Text style={{ color: '#6b7280', textAlign: 'center', lineHeight: 22, fontSize: 15 }}>
                Přidejte si nemovitosti do oblíbených kliknutím na srdíčko u inzerátu
              </Text>
            </View>
          ) : (
            <View style={{ paddingTop: 16, paddingBottom: 20 }}>
              {favoriteProperties.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onPress={() => handlePropertyPress(property)}
                  onFavoritePress={() => toggleFavorite(property.id)}
                  isFavorite={true}
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
