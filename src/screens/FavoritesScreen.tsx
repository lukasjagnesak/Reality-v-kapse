import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { usePropertyStore } from "../state/propertyStore";
import { Ionicons } from "@expo/vector-icons";
import { PropertyCard } from "../components/PropertyCard";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FavoritesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { properties, favoriteIds, toggleFavorite } = usePropertyStore();

  const favoriteProperties = properties.filter((p) => favoriteIds.includes(p.id));

  const handlePropertyPress = (property: typeof favoriteProperties[0]) => {
    navigation.navigate("PropertyDetail", { property });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <ScrollView className="flex-1">
        {favoriteProperties.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-6">
            <Ionicons name="heart-outline" size={64} color="#d1d5db" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
              Žádné oblíbené
            </Text>
            <Text className="text-gray-600 mt-2 text-center">
              Přidejte si nemovitosti do oblíbených kliknutím na srdíčko
            </Text>
          </View>
        ) : (
          <View className="pb-4">
            {favoriteProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onPress={() => handlePropertyPress(property)}
                onFavoritePress={() => toggleFavorite(property.id)}
                isFavorite={true}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
