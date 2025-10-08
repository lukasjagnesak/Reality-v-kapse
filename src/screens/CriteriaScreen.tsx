import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { usePropertyStore } from "../state/propertyStore";
import { Ionicons } from "@expo/vector-icons";
import type { PropertyType, PropertyDisposition } from "../types/property";

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

export default function CriteriaScreen() {
  const navigation = useNavigation();
  const { preferences, updatePreferences } = usePropertyStore();
  
  const [locations, setLocations] = useState<string[]>(preferences.locations);
  const [locationInput, setLocationInput] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>(preferences.propertyTypes);
  const [selectedDispositions, setSelectedDispositions] = useState<PropertyDisposition[]>(
    preferences.dispositions
  );
  const [minPrice, setMinPrice] = useState(String(preferences.priceRange.min));
  const [maxPrice, setMaxPrice] = useState(String(preferences.priceRange.max));
  const [minDiscount, setMinDiscount] = useState(String(preferences.minDiscountPercentage));
  const [notificationsEnabled, setNotificationsEnabled] = useState(preferences.notificationsEnabled);

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

  const handleSave = () => {
    updatePreferences({
      locations,
      propertyTypes: selectedTypes,
      dispositions: selectedDispositions,
      priceRange: {
        min: Number(minPrice) || 0,
        max: Number(maxPrice) || 50000000,
      },
      minDiscountPercentage: Number(minDiscount) || 0,
      notificationsEnabled,
    });
    navigation.goBack();
  };

  const handleResetFilters = () => {
    // Reset všech filtrů
    setLocations([]);
    setLocationInput("");
    setSelectedTypes(["byt", "dům"]);
    setSelectedDispositions(["1+kk", "1+1", "2+kk", "2+1", "3+kk", "3+1", "4+kk", "4+1"]);
    setMinPrice("0");
    setMaxPrice("50000000");
    setMinDiscount("0");
    
    // Okamžitě uložit
    updatePreferences({
      locations: [],
      propertyTypes: ["byt", "dům"],
      dispositions: ["1+kk", "1+1", "2+kk", "2+1", "3+kk", "3+1", "4+kk", "4+1"],
      priceRange: { min: 0, max: 50000000 },
      minDiscountPercentage: 0,
      notificationsEnabled,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Reset Button */}
          <View className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <Pressable
              onPress={handleResetFilters}
              className="bg-red-50 border border-red-200 rounded-lg p-3 flex-row items-center justify-center"
            >
              <Ionicons name="refresh" size={20} color="#dc2626" />
              <Text className="text-red-600 font-semibold ml-2">
                Resetovat všechny filtry
              </Text>
            </Pressable>
          </View>

          {/* Notifications */}
          <View className="px-6 py-4 mb-2 bg-white border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  Push notifikace
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  Dostávat upozornění na nové nabídky
                </Text>
              </View>
              <Pressable
                onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-14 h-8 rounded-full justify-center ${
                  notificationsEnabled ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <View
                  className={`w-6 h-6 rounded-full bg-white ${
                    notificationsEnabled ? "ml-7" : "ml-1"
                  }`}
                />
              </Pressable>
            </View>
          </View>

          {/* Locations */}
          <View className="px-6 py-6 mb-2 bg-white border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Lokalita
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
          <View className="px-6 py-6 mb-2 bg-white border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
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
          <View className="px-6 py-6 mb-2 bg-white border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
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
          <View className="px-6 py-6 mb-2 bg-white border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
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
          <View className="px-6 py-6 bg-white">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Minimální sleva oproti průměru (%)
            </Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-3 text-base"
              placeholder="5"
              value={minDiscount}
              onChangeText={setMinDiscount}
              keyboardType="numeric"
            />
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
          <Pressable
            onPress={handleSave}
            className="bg-blue-500 rounded-xl py-4 items-center"
          >
            <Text className="text-white text-lg font-semibold">
              Uložit změny
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
