import React from "react";
import { View, Text, Pressable, ScrollView, Image, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { usePropertyStore } from "../state/propertyStore";
import {
  formatPrice,
  getRatingColor,
  getRatingBackgroundColor,
  calculateMortgage,
} from "../utils/propertyUtils";
import { Ionicons } from "@expo/vector-icons";

type PropertyDetailRouteProp = RouteProp<RootStackParamList, "PropertyDetail">;

export default function PropertyDetailScreen() {
  const route = useRoute<PropertyDetailRouteProp>();
  const { property } = route.params;
  const { toggleFavorite, isFavorite, currentInterestRate } = usePropertyStore();

  const downPaymentPercent = 20;
  const loanTermYears = 30;

  const mortgage = calculateMortgage(
    property.price,
    downPaymentPercent,
    currentInterestRate,
    loanTermYears
  );

  const handleOpenSource = () => {
    Linking.openURL(property.sourceUrl);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1">
        {/* Image */}
        <View className="relative">
          <Image
            source={{ uri: property.imageUrl }}
            className="w-full h-80"
            resizeMode="cover"
          />

          {/* Rating Badge */}
          <View
            className="absolute top-4 left-4 rounded-lg px-4 py-2"
            style={{
              backgroundColor: getRatingBackgroundColor(property.rating),
            }}
          >
            <Text
              className="text-2xl font-bold"
              style={{ color: getRatingColor(property.rating) }}
            >
              {property.rating}
            </Text>
          </View>

          {/* Discount Badge */}
          <View className="absolute top-4 right-4 bg-red-500 rounded-lg px-4 py-2">
            <Text className="text-white text-base font-bold">
              -{property.discountPercentage}%
            </Text>
          </View>

          {/* Favorite Button */}
          <Pressable
            onPress={() => toggleFavorite(property.id)}
            className="absolute bottom-4 right-4 bg-white rounded-full p-3"
          >
            <Ionicons
              name={isFavorite(property.id) ? "heart" : "heart-outline"}
              size={28}
              color={isFavorite(property.id) ? "#ef4444" : "#6b7280"}
            />
          </Pressable>
        </View>

        {/* Content */}
        <View className="p-6">
          {/* Title and Location */}
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            {property.title}
          </Text>

          <View className="flex-row items-center mb-4">
            <Ionicons name="location" size={20} color="#6b7280" />
            <Text className="text-base text-gray-600 ml-2">
              {property.location}
            </Text>
          </View>

          {/* Price */}
          <View className="bg-blue-50 rounded-xl p-4 mb-6">
            <Text className="text-sm text-gray-600 mb-1">Cena</Text>
            <Text className="text-4xl font-bold text-blue-600 mb-2">
              {formatPrice(property.price)}
            </Text>
            <Text className="text-sm text-gray-600">
              {formatPrice(property.pricePerM2)} za m²
            </Text>
          </View>

          {/* Key Stats */}
          <View className="flex-row justify-between mb-6">
            <View className="flex-1 bg-gray-50 rounded-xl p-4 mr-2">
              <Text className="text-sm text-gray-600 mb-1">Dispozice</Text>
              <Text className="text-2xl font-bold text-gray-900">
                {property.disposition}
              </Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-xl p-4 mr-2">
              <Text className="text-sm text-gray-600 mb-1">Rozloha</Text>
              <Text className="text-2xl font-bold text-gray-900">
                {property.area} m²
              </Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-xl p-4">
              <Text className="text-sm text-gray-600 mb-1">Typ</Text>
              <Text className="text-2xl font-bold text-gray-900">
                {property.type}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-3">
              Popis
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              {property.description}
            </Text>
          </View>

          {/* Mortgage Calculator */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-3">
              Kalkulace hypotéky
            </Text>

            <View className="bg-green-50 rounded-xl p-4 mb-4">
              <Text className="text-sm text-gray-600 mb-1">
                Měsíční splátka
              </Text>
              <Text className="text-3xl font-bold text-green-600">
                {formatPrice(mortgage.monthlyPayment)}
              </Text>
              <Text className="text-sm text-gray-600 mt-2">
                při úroku {currentInterestRate}% na {loanTermYears} let
              </Text>
            </View>

            <View className="space-y-3">
              <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
                <Text className="text-sm text-gray-600">Akontace ({downPaymentPercent}%)</Text>
                <Text className="text-base font-semibold text-gray-900">
                  {formatPrice(mortgage.downPayment)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
                <Text className="text-sm text-gray-600">Výše úvěru</Text>
                <Text className="text-base font-semibold text-gray-900">
                  {formatPrice(mortgage.loanAmount)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
                <Text className="text-sm text-gray-600">Celkem zaplatíte</Text>
                <Text className="text-base font-semibold text-gray-900">
                  {formatPrice(mortgage.totalPaid + mortgage.downPayment)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-3">
                <Text className="text-sm text-gray-600">Celkem na úrocích</Text>
                <Text className="text-base font-semibold text-gray-900">
                  {formatPrice(mortgage.totalInterest)}
                </Text>
              </View>
            </View>
          </View>

          {/* Source Info */}
          <View className="bg-gray-50 rounded-xl p-4 mb-6">
            <Text className="text-sm text-gray-600 mb-1">Zdroj</Text>
            <Text className="text-base font-semibold text-gray-900 capitalize">
              {property.source}.cz
            </Text>
          </View>

          {/* Open Source Button */}
          <Pressable
            onPress={handleOpenSource}
            className="bg-blue-500 rounded-xl py-4 items-center mb-4"
          >
            <View className="flex-row items-center">
              <Text className="text-white text-lg font-semibold mr-2">
                Zobrazit na {property.source}.cz
              </Text>
              <Ionicons name="open-outline" size={20} color="white" />
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
