import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { usePropertyStore } from "../state/propertyStore";
import { useUserStore } from "../state/userStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import type { PropertyType, PropertyDisposition } from "../types/property";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PROPERTY_TYPES: { value: PropertyType; label: string; icon: string }[] = [
  { value: "byt", label: "Byt", icon: "business" },
  { value: "dům", label: "Dům", icon: "home" },
  { value: "pozemek", label: "Pozemek", icon: "map" },
  { value: "komerční", label: "Komerční", icon: "storefront" },
];

const DISPOSITIONS: { value: PropertyDisposition; label: string }[] = [
  { value: "1+kk", label: "1+kk" },
  { value: "1+1", label: "1+1" },
  { value: "2+kk", label: "2+kk" },
  { value: "2+1", label: "2+1" },
  { value: "3+kk", label: "3+kk" },
  { value: "3+1", label: "3+1" },
  { value: "4+kk", label: "4+kk" },
  { value: "4+1", label: "4+1" },
  { value: "5+kk", label: "5+kk" },
  { value: "5+1", label: "5+1" },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { preferences, updatePreferences, completeSetup, savePreferencesToDatabase } = usePropertyStore();
  const profile = useUserStore((state) => state.profile);

  const [locations, setLocations] = useState<string[]>(preferences.locations);
  const [locationInput, setLocationInput] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>(preferences.propertyTypes);
  const [selectedDispositions, setSelectedDispositions] = useState<PropertyDisposition[]>(preferences.dispositions);
  const [minPrice, setMinPrice] = useState(String(preferences.priceRange.min));
  const [maxPrice, setMaxPrice] = useState(String(preferences.priceRange.max));
  const [minDiscount, setMinDiscount] = useState(String(preferences.minDiscountPercentage));
  const [saving, setSaving] = useState(false);

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) });
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const toggleType = (type: PropertyType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleDisposition = (disposition: PropertyDisposition) => {
    setSelectedDispositions((prev) =>
      prev.includes(disposition) ? prev.filter((d) => d !== disposition) : [...prev, disposition]
    );
  };

  const addLocation = () => {
    if (locationInput.trim() && !locations.includes(locationInput.trim())) {
      setLocations([...locations, locationInput.trim()]);
      setLocationInput("");
    }
  };

  const removeLocation = (location: string) => {
    setLocations(locations.filter((loc) => loc !== location));
  };

  const handleComplete = async () => {
    if (locations.length === 0 || selectedTypes.length === 0) {
      Alert.alert("Chyba", "Vyberte prosím alespoň jednu lokalitu a typ nemovitosti");
      return;
    }
    setSaving(true);
    try {
      updatePreferences({
        locations,
        propertyTypes: selectedTypes,
        dispositions: selectedDispositions,
        priceRange: { min: Number(minPrice) || 0, max: Number(maxPrice) || 50000000 },
        minDiscountPercentage: Number(minDiscount) || 0,
      });
      if (profile?.id) await savePreferencesToDatabase(profile.id);
      completeSetup();
      navigation.replace("MainTabs");
    } catch (error) {
      Alert.alert("Chyba", "Nepodařilo se uložit preference. Pokračujeme s lokálním nastavením.", [
        { text: "OK", onPress: () => { completeSetup(); navigation.replace("MainTabs"); } },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#ffffff', letterSpacing: -0.3 }}>{title}</Text>
      {subtitle && <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{subtitle}</Text>}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
      <LinearGradient
        colors={['#1a1040', '#0A0A0F']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 120 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Animated.View style={[{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 }, headerStyle]}>
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: 'rgba(99,102,241,0.15)',
                alignSelf: 'flex-start',
                borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 16,
              }}>
                <Ionicons name="sparkles" size={14} color="#818cf8" style={{ marginRight: 6 }} />
                <Text style={{ color: '#818cf8', fontSize: 13, fontWeight: '600' }}>Nastavení preferencí</Text>
              </View>
              <Text style={{ fontSize: 30, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5, lineHeight: 36 }}>
                Vítejte v{'\n'}Reality v Kapse
              </Text>
              <Text style={{ fontSize: 15, color: '#9ca3af', marginTop: 10, lineHeight: 22 }}>
                Nastavte si preference a my vám budeme posílat notifikace o výhodných nabídkách.
              </Text>
            </Animated.View>

            <Animated.View style={[{ paddingHorizontal: 24 }, contentStyle]}>

              {/* Locations */}
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: 20, padding: 20, marginBottom: 16,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
              }}>
                <SectionTitle
                  title="Lokalita"
                  subtitle="Zadejte města nebo oblasti, které vás zajímají"
                />
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderRadius: 12,
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                    flexDirection: 'row', alignItems: 'center',
                    paddingHorizontal: 14, marginRight: 10,
                  }}>
                    <Ionicons name="location-outline" size={16} color="#6b7280" style={{ marginRight: 8 }} />
                    <TextInput
                      style={{ flex: 1, color: '#ffffff', paddingVertical: 13, fontSize: 15 }}
                      placeholder="např. Praha, Brno..."
                      placeholderTextColor="#4b5563"
                      value={locationInput}
                      onChangeText={setLocationInput}
                      onSubmitEditing={addLocation}
                      returnKeyType="done"
                    />
                  </View>
                  <Pressable
                    onPress={addLocation}
                    style={{ borderRadius: 12, overflow: 'hidden' }}
                  >
                    <LinearGradient
                      colors={['#6366f1', '#3b82f6']}
                      style={{ paddingHorizontal: 16, paddingVertical: 13, justifyContent: 'center', alignItems: 'center' }}
                    >
                      <Ionicons name="add" size={22} color="white" />
                    </LinearGradient>
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {locations.map((location) => (
                    <View
                      key={location}
                      style={{
                        backgroundColor: 'rgba(99,102,241,0.2)',
                        borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
                        marginRight: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center',
                        borderWidth: 1, borderColor: 'rgba(99,102,241,0.4)',
                      }}
                    >
                      <Text style={{ color: '#818cf8', marginRight: 8, fontWeight: '600', fontSize: 14 }}>{location}</Text>
                      <Pressable onPress={() => removeLocation(location)}>
                        <Ionicons name="close-circle" size={18} color="#818cf8" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>

              {/* Property Types */}
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: 20, padding: 20, marginBottom: 16,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
              }}>
                <SectionTitle title="Typ nemovitosti" />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {PROPERTY_TYPES.map((type) => {
                    const isSelected = selectedTypes.includes(type.value);
                    return (
                      <Pressable
                        key={type.value}
                        onPress={() => toggleType(type.value)}
                        style={{
                          paddingHorizontal: 18, paddingVertical: 12,
                          borderRadius: 14, marginRight: 10, marginBottom: 10,
                          backgroundColor: isSelected ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)',
                          borderWidth: 1,
                          borderColor: isSelected ? '#6366f1' : 'rgba(255,255,255,0.1)',
                          flexDirection: 'row', alignItems: 'center',
                        }}
                      >
                        <Ionicons
                          name={type.icon as any}
                          size={16}
                          color={isSelected ? '#818cf8' : '#6b7280'}
                          style={{ marginRight: 6 }}
                        />
                        <Text style={{ color: isSelected ? '#818cf8' : '#9ca3af', fontWeight: '600', fontSize: 14 }}>
                          {type.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Dispositions */}
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: 20, padding: 20, marginBottom: 16,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
              }}>
                <SectionTitle title="Dispozice" />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {DISPOSITIONS.map((disposition) => {
                    const isSelected = selectedDispositions.includes(disposition.value);
                    return (
                      <Pressable
                        key={disposition.value}
                        onPress={() => toggleDisposition(disposition.value)}
                        style={{
                          paddingHorizontal: 14, paddingVertical: 10,
                          borderRadius: 12, marginRight: 8, marginBottom: 8,
                          backgroundColor: isSelected ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)',
                          borderWidth: 1,
                          borderColor: isSelected ? '#6366f1' : 'rgba(255,255,255,0.1)',
                        }}
                      >
                        <Text style={{ color: isSelected ? '#818cf8' : '#9ca3af', fontWeight: '600', fontSize: 13 }}>
                          {disposition.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Price Range */}
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: 20, padding: 20, marginBottom: 16,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
              }}>
                <SectionTitle title="Cenové rozpětí (Kč)" />
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: '600' }}>OD</Text>
                    <View style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      borderRadius: 12,
                      borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                      paddingHorizontal: 14,
                    }}>
                      <TextInput
                        style={{ color: '#ffffff', paddingVertical: 13, fontSize: 15 }}
                        placeholder="0"
                        placeholderTextColor="#4b5563"
                        value={minPrice}
                        onChangeText={setMinPrice}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: '600' }}>DO</Text>
                    <View style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      borderRadius: 12,
                      borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                      paddingHorizontal: 14,
                    }}>
                      <TextInput
                        style={{ color: '#ffffff', paddingVertical: 13, fontSize: 15 }}
                        placeholder="50 000 000"
                        placeholderTextColor="#4b5563"
                        value={maxPrice}
                        onChangeText={setMaxPrice}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Minimum Discount */}
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: 20, padding: 20, marginBottom: 16,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
              }}>
                <SectionTitle
                  title="Minimální sleva (%)"
                  subtitle="Dostávejte notifikace pouze o nemovitostech, které jsou levnější než průměr v lokalitě"
                />
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                  paddingHorizontal: 14,
                  flexDirection: 'row', alignItems: 'center',
                }}>
                  <Ionicons name="trending-down" size={18} color="#10b981" style={{ marginRight: 10 }} />
                  <TextInput
                    style={{ flex: 1, color: '#ffffff', paddingVertical: 13, fontSize: 15 }}
                    placeholder="5"
                    placeholderTextColor="#4b5563"
                    value={minDiscount}
                    onChangeText={setMinDiscount}
                    keyboardType="numeric"
                  />
                  <Text style={{ color: '#6b7280', fontSize: 16 }}>%</Text>
                </View>
              </View>
            </Animated.View>
          </ScrollView>

          {/* Bottom Button */}
          <View style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            backgroundColor: '#0A0A0F',
            borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
            paddingHorizontal: 24, paddingVertical: 20,
          }}>
            <Pressable
              onPress={handleComplete}
              disabled={locations.length === 0 || selectedTypes.length === 0 || saving}
              style={{ borderRadius: 16, overflow: 'hidden', opacity: (locations.length === 0 || selectedTypes.length === 0 || saving) ? 0.5 : 1 }}
            >
              <LinearGradient
                colors={['#6366f1', '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 18, alignItems: 'center' }}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontSize: 17, fontWeight: '700', marginRight: 8 }}>
                      Pokračovat
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </View>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
