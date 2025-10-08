import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../api/supabase";

interface LocationSuggestion {
  type: "city" | "district" | "street";
  city: string;
  district?: string;
  street?: string;
  propertyCount: number;
  displayText: string;
}

interface LocationPickerProps {
  selectedLocations: string[];
  onAddLocation: (location: string) => void;
  onRemoveLocation: (location: string) => void;
}

export function LocationPicker({
  selectedLocations,
  onAddLocation,
  onRemoveLocation,
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      fetchSuggestions(searchQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const fetchSuggestions = async (query: string) => {
    setLoading(true);
    setShowSuggestions(true);

    try {
      const lowerQuery = query.toLowerCase();
      const results: LocationSuggestion[] = [];

      // Hledat města
      const { data: cities, error: citiesError } = await supabase
        .from("unique_cities")
        .select("city, property_count")
        .ilike("city", `%${lowerQuery}%`)
        .limit(5);

      if (!citiesError && cities) {
        cities.forEach((city) => {
          results.push({
            type: "city",
            city: city.city,
            propertyCount: city.property_count,
            displayText: city.city,
          });
        });
      }

      // Hledat části města
      const { data: districts, error: districtsError } = await supabase
        .from("unique_districts")
        .select("city, district, property_count")
        .or(`city.ilike.%${lowerQuery}%,district.ilike.%${lowerQuery}%`)
        .limit(10);

      if (!districtsError && districts) {
        districts.forEach((district) => {
          results.push({
            type: "district",
            city: district.city,
            district: district.district,
            propertyCount: district.property_count,
            displayText: `${district.city} - ${district.district}`,
          });
        });
      }

      // Hledat ulice
      const { data: streets, error: streetsError } = await supabase
        .from("unique_streets")
        .select("city, district, street, property_count")
        .or(`city.ilike.%${lowerQuery}%,district.ilike.%${lowerQuery}%,street.ilike.%${lowerQuery}%`)
        .limit(10);

      if (!streetsError && streets) {
        streets.forEach((street) => {
          results.push({
            type: "street",
            city: street.city,
            district: street.district,
            street: street.street,
            propertyCount: street.property_count,
            displayText: `${street.street}, ${street.city} - ${street.district}`,
          });
        });
      }

      // Seřadit podle relevance (města první, pak části, pak ulice)
      results.sort((a, b) => {
        if (a.type !== b.type) {
          const order = { city: 0, district: 1, street: 2 };
          return order[a.type] - order[b.type];
        }
        return b.propertyCount - a.propertyCount;
      });

      setSuggestions(results.slice(0, 10));
    } catch (error) {
      console.error("❌ Chyba při načítání našeptávače:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    onAddLocation(suggestion.displayText);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const getIconForType = (type: LocationSuggestion["type"]) => {
    switch (type) {
      case "city":
        return "business";
      case "district":
        return "location";
      case "street":
        return "map";
      default:
        return "location";
    }
  };

  const getLabelForType = (type: LocationSuggestion["type"]) => {
    switch (type) {
      case "city":
        return "Město";
      case "district":
        return "Část města";
      case "street":
        return "Ulice";
      default:
        return "";
    }
  };

  return (
    <View className="relative">
      {/* Search Input */}
      <View className="flex-row mb-3">
        <View className="flex-1 relative">
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 text-base pr-10"
            placeholder="Hledat město, část nebo ulici..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setShowSuggestions(true)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {loading && (
            <View className="absolute right-3 top-3">
              <ActivityIndicator size="small" color="#3b82f6" />
            </View>
          )}
        </View>
      </View>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <View className="bg-white border border-gray-200 rounded-lg mb-3 overflow-hidden">
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => `${item.displayText}-${index}`}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => handleSelectSuggestion(item)}
                className={`flex-row items-center p-3 ${
                  index < suggestions.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                  <Ionicons
                    name={getIconForType(item.type)}
                    size={20}
                    color="#3b82f6"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-900 font-medium">
                    {item.displayText}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    {getLabelForType(item.type)} • {item.propertyCount} nabídek
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </Pressable>
            )}
          />
        </View>
      )}

      {/* No Results */}
      {showSuggestions && searchQuery.length >= 2 && suggestions.length === 0 && !loading && (
        <View className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
          <Text className="text-gray-600 text-center">
            Žádné výsledky pro "{searchQuery}"
          </Text>
        </View>
      )}

      {/* Selected Locations */}
      {selectedLocations.length > 0 && (
        <View className="flex-row flex-wrap mt-2">
          {selectedLocations.map((location) => (
            <View
              key={location}
              className="bg-blue-100 rounded-full px-4 py-2 mr-2 mb-2 flex-row items-center"
            >
              <Text className="text-blue-700 mr-2">{location}</Text>
              <Pressable onPress={() => onRemoveLocation(location)}>
                <Ionicons name="close-circle" size={18} color="#1d4ed8" />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Hint */}
      <Text className="text-xs text-gray-500 mt-2">
        💡 Začněte psát město (např. "Brno"), část města nebo ulici
      </Text>
    </View>
  );
}
