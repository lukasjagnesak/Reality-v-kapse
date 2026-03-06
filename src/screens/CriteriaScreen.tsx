import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { usePropertyStore } from "../state/propertyStore";
import { useUserStore } from "../state/userStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { PropertyType, PropertyDisposition } from "../types/property";
import { LocationPicker } from "../components/LocationPicker";

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

export default function CriteriaScreen() {
  const navigation = useNavigation();
  const { preferences, updatePreferences, savePreferencesToDatabase } = usePropertyStore();
  const profile = useUserStore((state) => state.profile);

  const [locations, setLocations] = useState<string[]>(preferences.locations);
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>(preferences.propertyTypes);
  const [selectedDispositions, setSelectedDispositions] = useState<PropertyDisposition[]>(preferences.dispositions);
  const [minPrice, setMinPrice] = useState(String(preferences.priceRange.min));
  const [maxPrice, setMaxPrice] = useState(String(preferences.priceRange.max));
  const [minDiscount, setMinDiscount] = useState(String(preferences.minDiscountPercentage));
  const [notificationsEnabled, setNotificationsEnabled] = useState(preferences.notificationsEnabled);
  const [saving, setSaving] = useState(false);

  const toggleType = (type: PropertyType) => {
    setSelectedTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  };

  const toggleDisposition = (disposition: PropertyDisposition) => {
    setSelectedDispositions((prev) => prev.includes(disposition) ? prev.filter((d) => d !== disposition) : [...prev, disposition]);
  };

  const addLocation = (location: string) => {
    if (location.trim() && !locations.includes(location.trim())) {
      setLocations([...locations, location.trim()]);
    }
  };

  const removeLocation = (location: string) => {
    setLocations(locations.filter((loc) => loc !== location));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      updatePreferences({
        locations, propertyTypes: selectedTypes, dispositions: selectedDispositions,
        priceRange: { min: Number(minPrice) || 0, max: Number(maxPrice) || 50000000 },
        minDiscountPercentage: Number(minDiscount) || 0, notificationsEnabled,
      });
      if (profile?.id) await savePreferencesToDatabase(profile.id);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Chyba", "Nepodařilo se uložit preference do databáze");
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const handleResetFilters = () => {
    setLocations([]);
    setSelectedTypes(["byt", "dům"]);
    setSelectedDispositions(["1+kk", "1+1", "2+kk", "2+1", "3+kk", "3+1", "4+kk", "4+1"]);
    setMinPrice("0");
    setMaxPrice("50000000");
    setMinDiscount("0");
    updatePreferences({
      locations: [], propertyTypes: ["byt", "dům"],
      dispositions: ["1+kk", "1+1", "2+kk", "2+1", "3+kk", "3+1", "4+kk", "4+1"],
      priceRange: { min: 0, max: 50000000 }, minDiscountPercentage: 0, notificationsEnabled,
    });
  };

  const SectionCard = ({ children, style }: { children: React.ReactNode; style?: any }) => (
    <View style={[{
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 20, padding: 20, marginBottom: 14,
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    }, style]}>
      {children}
    </View>
  );

  const SectionLabel = ({ title }: { title: string }) => (
    <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 14 }}>{title}</Text>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Reset Button */}
          <Pressable
            onPress={handleResetFilters}
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              borderRadius: 16, paddingHorizontal: 18, paddingVertical: 14,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', marginBottom: 14,
            }}
          >
            <Ionicons name="refresh" size={18} color="#ef4444" style={{ marginRight: 8 }} />
            <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 15 }}>
              Resetovat všechny filtry
            </Text>
          </Pressable>

          {/* Notifications */}
          <SectionCard>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Ionicons name="notifications" size={18} color="#818cf8" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff' }}>Push notifikace</Text>
                </View>
                <Text style={{ color: '#6b7280', fontSize: 13 }}>Upozornění na nové výhodné nabídky</Text>
              </View>
              <Pressable
                onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                style={{
                  width: 52, height: 30, borderRadius: 15,
                  backgroundColor: notificationsEnabled ? '#6366f1' : 'rgba(255,255,255,0.1)',
                  justifyContent: 'center',
                  borderWidth: 1, borderColor: notificationsEnabled ? '#6366f1' : 'rgba(255,255,255,0.1)',
                }}
              >
                <View style={{
                  width: 22, height: 22, borderRadius: 11, backgroundColor: '#ffffff',
                  marginLeft: notificationsEnabled ? 26 : 4,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.3, shadowRadius: 2,
                }} />
              </Pressable>
            </View>
          </SectionCard>

          {/* Locations */}
          <SectionCard>
            <SectionLabel title="Lokalita" />
            <LocationPicker
              selectedLocations={locations}
              onAddLocation={addLocation}
              onRemoveLocation={removeLocation}
            />
          </SectionCard>

          {/* Property Types */}
          <SectionCard>
            <SectionLabel title="Typ nemovitosti" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {PROPERTY_TYPES.map((type) => {
                const isSelected = selectedTypes.includes(type.value);
                return (
                  <Pressable
                    key={type.value}
                    onPress={() => toggleType(type.value)}
                    style={{
                      paddingHorizontal: 16, paddingVertical: 11,
                      borderRadius: 14, marginRight: 10, marginBottom: 10,
                      backgroundColor: isSelected ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                      borderWidth: 1, borderColor: isSelected ? '#6366f1' : 'rgba(255,255,255,0.1)',
                      flexDirection: 'row', alignItems: 'center',
                    }}
                  >
                    <Ionicons name={type.icon as any} size={15} color={isSelected ? '#818cf8' : '#6b7280'} style={{ marginRight: 6 }} />
                    <Text style={{ color: isSelected ? '#818cf8' : '#9ca3af', fontWeight: '600', fontSize: 14 }}>
                      {type.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </SectionCard>

          {/* Dispositions */}
          <SectionCard>
            <SectionLabel title="Dispozice" />
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
                      backgroundColor: isSelected ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                      borderWidth: 1, borderColor: isSelected ? '#6366f1' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <Text style={{ color: isSelected ? '#818cf8' : '#9ca3af', fontWeight: '600', fontSize: 13 }}>
                      {disposition.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </SectionCard>

          {/* Price Range */}
          <SectionCard>
            <SectionLabel title="Cenové rozpětí (Kč)" />
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ color: '#6b7280', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>OD</Text>
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14,
                }}>
                  <TextInput
                    style={{ color: '#ffffff', paddingVertical: 12, fontSize: 15 }}
                    placeholder="0"
                    placeholderTextColor="#4b5563"
                    value={minPrice}
                    onChangeText={setMinPrice}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#6b7280', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>DO</Text>
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14,
                }}>
                  <TextInput
                    style={{ color: '#ffffff', paddingVertical: 12, fontSize: 15 }}
                    placeholder="50 000 000"
                    placeholderTextColor="#4b5563"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </SectionCard>

          {/* Minimum Discount */}
          <SectionCard>
            <SectionLabel title="Minimální sleva (%)" />
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
              paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center',
            }}>
              <Ionicons name="trending-down" size={18} color="#10b981" style={{ marginRight: 10 }} />
              <TextInput
                style={{ flex: 1, color: '#ffffff', paddingVertical: 14, fontSize: 15 }}
                placeholder="5"
                placeholderTextColor="#4b5563"
                value={minDiscount}
                onChangeText={setMinDiscount}
                keyboardType="numeric"
              />
              <Text style={{ color: '#6b7280', fontSize: 16 }}>%</Text>
            </View>
          </SectionCard>
        </ScrollView>

        {/* Bottom Save Button */}
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: '#0A0A0F',
          borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
          paddingHorizontal: 16, paddingVertical: 18,
        }}>
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={{ borderRadius: 16, overflow: 'hidden', opacity: saving ? 0.6 : 1 }}
          >
            <LinearGradient
              colors={['#6366f1', '#3b82f6']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={{ color: 'white', fontSize: 17, fontWeight: '700' }}>Uložit změny</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
