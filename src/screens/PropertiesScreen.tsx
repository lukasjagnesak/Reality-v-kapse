import React, { useEffect } from "react";
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { usePropertyStore } from "../state/propertyStore";
import { mockProperties } from "../api/mockData";
import { fetchPropertiesFromGoogleSheets } from "../api/googleSheetsService";
import { Ionicons } from "@expo/vector-icons";
import { PropertyCard } from "../components/PropertyCard";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PropertiesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    filteredProperties,
    setProperties,
    toggleFavorite,
    isFavorite,
    preferences,
  } = usePropertyStore();

  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const loadProperties = async () => {
    try {
      console.log("Načítám data z Google Sheets...");
      const properties = await fetchPropertiesFromGoogleSheets();
      
      if (properties.length > 0) {
        setProperties(properties);
        console.log(`Úspěšně načteno ${properties.length} nemovitostí`);
      } else {
        console.log("Google Sheets nevrátil žádná data, používám mock data");
        setProperties(mockProperties);
      }
    } catch (error) {
      console.error("Chyba při načítání nemovitostí:", error);
      Alert.alert(
        "Chyba při načítání",
        "Nepodařilo se načíst data. Používám testovací data.",
        [{ text: "OK" }]
      );
      setProperties(mockProperties);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadProperties();
    setRefreshing(false);
  }, []);

  const handlePropertyPress = (property: typeof filteredProperties[0]) => {
    navigation.navigate("PropertyDetail", { property });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center" edges={["bottom"]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">Načítám nemovitosti...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
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
              Zkuste upravit vaše kritéria v záložce Kritéria
            </Text>
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
