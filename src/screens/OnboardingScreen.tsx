import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { usePropertyStore } from "../state/propertyStore";
import { useUserStore } from "../state/userStore";
import { Ionicons } from "@expo/vector-icons";
import type { PropertyType, PropertyDisposition } from "../types/property";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "byt", label: "Byt" },
  { value: "dům", label: "Dům" },
  { value: "pozemek", label: "Pozemek" },
  { value: "komerční", label: "Komerční" },
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
  const [selectedDispositions, setSelectedDispositions] = useState<PropertyDisposition[]>(
    preferences.dispositions
  );
  const [minPrice, setMinPrice] = useState(String(preferences.priceRange.min));
  const [maxPrice, setMaxPrice] = useState(String(preferences.priceRange.max));
  const [minDiscount, setMinDiscount] = useState(String(preferences.minDiscountPercentage));
  const [saving, setSaving] = useState(false);

  const toggleType = (type: PropertyType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleDisposition = (disposition: PropertyDisposition) => {
    setSelectedDispositions((prev) =>
      prev.includes(disposition)
        ? prev.filter((d) => d !== disposition)
        : [...prev, disposition]
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
      // Update local preferences
      updatePreferences({
        locations,
        propertyTypes: selectedTypes,
        dispositions: selectedDispositions,
        priceRange: {
          min: Number(minPrice) || 0,
          max: Number(maxPrice) || 50000000,
        },
        minDiscountPercentage: Number(minDiscount) || 0,
      });

      // Save to database if user is logged in
      if (profile?.id) {
        await savePreferencesToDatabase(profile.id);
        console.log("✅ Preferences saved to database");
      }

      // Mark setup as complete
      completeSetup();
      
      // Navigate to main app
      navigation.replace("MainTabs");
    } catch (error) {
      console.error("❌ Error saving preferences:", error);
      Alert.alert(
        "Chyba",
        "Nepodařilo se uložit preference. Pokračujeme s lokálním nastavením.",
        [
          {
            text: "OK",
            onPress: () => {
              completeSetup();
              navigation.replace("MainTabs");
            },
          },
        ]
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="px-6 pt-8 pb-6">
            <Text className="text-4xl font-bold text-gray-900 mb-2">
              Vítejte v Reality v Kapse
            </Text>
            <Text className="text-lg text-gray-600">
              Nastavte si preference a my vám budeme posílat notifikace o výhodných nabídkách.
            </Text>
          </View>

          {/* Locations */}
          <View className="px-6 mb-8">
            <Text className="text-xl font-semibold text-gray-900 mb-3">
              Lokalita
            </Text>
            <Text className="text-sm text-gray-600 mb-3">
              Zadejte města nebo oblasti, které vás zajímají
            </Text>
            
            <View className="flex-row mb-3">
              <TextInput
                className="flex-1 bg-gray-100 rounded-lg px-4 py-3 text-base"
                placeholder="např. Praha, Brno..."
                value={locationInput}
                onChangeText={setLocationInput}
                onSubmitEditing={addLocation}
                returnKeyType="done"
              />
              <Pressable
                onPress={addLocation}
                className="ml-2 bg-blue-500 rounded-lg px-4 justify-center"
              >
                <Ionicons name="add" size={24} color="white" />
              </Pressable>
            </View>

            <View className="flex-row flex-wrap">
              {locations.map((location) => (
                <View
                  key={location}
                  className="bg-blue-100 rounded-full px-4 py-2 mr-2 mb-2 flex-row items-center"
                >
                  <Text className="text-blue-700 mr-2">{location}</Text>
                  <Pressable onPress={() => removeLocation(location)}>
                    <Ionicons name="close-circle" size={18} color="#1d4ed8" />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          {/* Property Types */}
          <View className="px-6 mb-8">
            <Text className="text-xl font-semibold text-gray-900 mb-3">
              Typ nemovitosti
            </Text>
            <View className="flex-row flex-wrap">
              {PROPERTY_TYPES.map((type) => (
                <Pressable
                  key={type.value}
                  onPress={() => toggleType(type.value)}
                  className={`px-6 py-3 rounded-lg mr-3 mb-3 ${
                    selectedTypes.includes(type.value)
                      ? "bg-blue-500"
                      : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-base font-medium ${
                      selectedTypes.includes(type.value)
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Dispositions */}
          <View className="px-6 mb-8">
            <Text className="text-xl font-semibold text-gray-900 mb-3">
              Dispozice
            </Text>
            <View className="flex-row flex-wrap">
              {DISPOSITIONS.map((disposition) => (
                <Pressable
                  key={disposition.value}
                  onPress={() => toggleDisposition(disposition.value)}
                  className={`px-5 py-3 rounded-lg mr-2 mb-2 ${
                    selectedDispositions.includes(disposition.value)
                      ? "bg-blue-500"
                      : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedDispositions.includes(disposition.value)
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {disposition.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Price Range */}
          <View className="px-6 mb-8">
            <Text className="text-xl font-semibold text-gray-900 mb-3">
              Cenové rozpětí (Kč)
            </Text>
            <View className="flex-row items-center">
              <View className="flex-1 mr-3">
                <Text className="text-sm text-gray-600 mb-1">Od</Text>
                <TextInput
                  className="bg-gray-100 rounded-lg px-4 py-3 text-base"
                  placeholder="0"
                  value={minPrice}
                  onChangeText={setMinPrice}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-1">Do</Text>
                <TextInput
                  className="bg-gray-100 rounded-lg px-4 py-3 text-base"
                  placeholder="10 000 000"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Minimum Discount */}
          <View className="px-6 mb-8">
            <Text className="text-xl font-semibold text-gray-900 mb-3">
              Minimální sleva oproti průměru (%)
            </Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-3 text-base"
              placeholder="5"
              value={minDiscount}
              onChangeText={setMinDiscount}
              keyboardType="numeric"
            />
            <Text className="text-sm text-gray-500 mt-2">
              Budete dostávat notifikace pouze o nemovitostech, které jsou levnější
              než průměr v dané lokalitě
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
          <Pressable
            onPress={handleComplete}
            disabled={locations.length === 0 || selectedTypes.length === 0 || saving}
            className={`bg-blue-500 rounded-xl py-4 items-center ${
              (locations.length === 0 || selectedTypes.length === 0 || saving) ? "opacity-50" : ""
            }`}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-semibold">
                Pokračovat
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
