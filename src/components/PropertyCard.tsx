import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Property } from "../types/property";
import { formatPrice } from "../utils/propertyUtils";
import { RatingBadge, DiscountBadge } from "./Badges";

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
  onFavoritePress: () => void;
  isFavorite: boolean;
}

export function PropertyCard({
  property,
  onPress,
  onFavoritePress,
  isFavorite,
}: PropertyCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white mb-2 overflow-hidden active:opacity-80"
    >
      {/* Image */}
      <View className="relative">
        <Image
          source={{ uri: property.imageUrl }}
          className="w-full h-64"
          resizeMode="cover"
        />

        {/* Rating Badge */}
        <View className="absolute top-3 left-3">
          <RatingBadge rating={property.rating} />
        </View>

        {/* Discount Badge */}
        <View className="absolute top-3 right-3">
          <DiscountBadge percentage={property.discountPercentage} />
        </View>

        {/* Favorite Button */}
        <Pressable
          onPress={onFavoritePress}
          className="absolute bottom-3 right-3 bg-white/90 rounded-full p-2"
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? "#ef4444" : "#6b7280"}
          />
        </Pressable>
      </View>

      {/* Content */}
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-900 mb-1">
          {property.title}
        </Text>

        <View className="flex-row items-center mb-2">
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-1">
            {property.location}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-sm text-gray-600">Dispozice</Text>
            <Text className="text-base font-semibold text-gray-900">
              {property.disposition}
            </Text>
          </View>
          <View>
            <Text className="text-sm text-gray-600">Rozloha</Text>
            <Text className="text-base font-semibold text-gray-900">
              {property.area} m²
            </Text>
          </View>
          <View>
            <Text className="text-sm text-gray-600">Cena/m²</Text>
            <Text className="text-base font-semibold text-gray-900">
              {formatPrice(property.pricePerM2)}
            </Text>
          </View>
        </View>

        <View className="border-t border-gray-200 pt-3">
          <Text className="text-2xl font-bold text-blue-600">
            {formatPrice(property.price)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
