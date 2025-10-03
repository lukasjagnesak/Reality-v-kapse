import React, { useEffect } from "react";
import { View, Text, Pressable, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { usePropertyStore } from "../state/propertyStore";
import { mockProperties } from "../api/mockData";
import { Ionicons } from "@expo/vector-icons";
import { PropertyCard } from "../components/PropertyCard";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    filteredProperties,
    setProperties,
    toggleFavorite,
    isFavorite,
    preferences,
  } = usePropertyStore();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    // Load mock properties on mount
    setProperties(mockProperties);
  }, [setProperties]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setProperties(mockProperties);
      setRefreshing(false);
    }, 1000);
  }, [setProperties]);

  const handlePropertyPress = (property: typeof filteredProperties[0]) => {
    navigation.navigate("PropertyDetail", { property });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      {/* Header Buttons */}
      <View className="flex-row justify-between items-center px-4 py-2 bg-white border-b border-gray-200">
        <Pressable
          onPress={() => navigation.navigate("Favorites")}
          className="p-2"
        >
          <Ionicons name="heart" size={24} color="#ef4444" />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("Settings")}
          className="p-2"
        >
          <Ionicons name="settings-outline" size={24} color="#6b7280" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats */}
        <View className="bg-white px-4 py-6 mb-2">
          <Text className="text-sm text-gray-600 mb-1">
            Nalezeno nabídek
          </Text>
          <Text className="text-3xl font-bold text-gray-900">
            {filteredProperties.length}
          </Text>
          {preferences.locations.length > 0 && (
            <Text className="text-sm text-gray-500 mt-2">
              v lokalitách: {preferences.locations.join(", ")}
            </Text>
          )}
        </View>

        {/* Properties List */}
        {filteredProperties.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-6">
            <Ionicons name="home-outline" size={64} color="#d1d5db" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
              Žádné nabídky
            </Text>
            <Text className="text-gray-600 mt-2 text-center">
              Zkuste upravit vaše preference v nastavení
            </Text>
            <Pressable
              onPress={() => navigation.navigate("Settings")}
              className="bg-blue-500 rounded-lg px-6 py-3 mt-4"
            >
              <Text className="text-white font-semibold">
                Upravit preference
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="pb-4">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onPress={() => handlePropertyPress(property)}
                onFavoritePress={() => toggleFavorite(property.id)}
                isFavorite={isFavorite(property.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
