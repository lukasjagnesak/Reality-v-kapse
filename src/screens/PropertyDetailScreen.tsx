import React from "react";
import { View, Text, Pressable, ScrollView, Image, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { usePropertyStore } from "../state/propertyStore";
import {
  formatPrice,
  getRatingColor,
  getRatingBackgroundColor,
  calculateMortgage,
  parseLocation,
  getMicroLocationComparison,
} from "../utils/propertyUtils";
import { Ionicons } from "@expo/vector-icons";

type PropertyDetailRouteProp = RouteProp<RootStackParamList, "PropertyDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PropertyDetailScreen() {
  const route = useRoute<PropertyDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { property } = route.params;
  const { toggleFavorite, isFavorite, currentInterestRate, properties } = usePropertyStore();

  const downPaymentPercent = 20;
  const loanTermYears = 30;

  const mortgage = calculateMortgage(
    property.price,
    downPaymentPercent,
    currentInterestRate,
    loanTermYears
  );

  const locationInfo = parseLocation(property.location);
  const comparison = getMicroLocationComparison(property, properties);

  const handleOpenSource = () => {
    Linking.openURL(property.sourceUrl);
  };

  const handleComparePropertyPress = (compareProperty: typeof properties[0]) => {
    navigation.push("PropertyDetail", { property: compareProperty });
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

          {/* Agent Contact */}
          {property.agent && (
            <View className="bg-white rounded-xl border-2 border-blue-100 p-5 mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="person" size={24} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">
                    {property.agent.name}
                  </Text>
                  {property.agent.company && (
                    <Text className="text-sm text-gray-600">
                      {property.agent.company}
                    </Text>
                  )}
                </View>
              </View>

              {property.agent.phone && (
                <Pressable
                  onPress={() => {
                    const phone = property.agent?.phone?.replace(/\s/g, "");
                    Linking.openURL(`tel:${phone}`);
                  }}
                  className="flex-row items-center bg-green-50 rounded-lg p-4 mb-3"
                >
                  <Ionicons name="call" size={20} color="#10b981" />
                  <Text className="text-green-700 font-semibold ml-3 flex-1">
                    {property.agent.phone}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#10b981" />
                </Pressable>
              )}

              {property.agent.email && (
                <Pressable
                  onPress={() => {
                    Linking.openURL(`mailto:${property.agent?.email}`);
                  }}
                  className="flex-row items-center bg-blue-50 rounded-lg p-4"
                >
                  <Ionicons name="mail" size={20} color="#3b82f6" />
                  <Text className="text-blue-700 font-semibold ml-3 flex-1">
                    {property.agent.email}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
                </Pressable>
              )}
            </View>
          )}

          {/* MicroLocation Comparison */}
          {comparison.totalCount > 0 && (
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-900 mb-3">
                Porovnání v {locationInfo.microLocation || locationInfo.district || locationInfo.city}
              </Text>

              {/* Statistics */}
              <View className="bg-blue-50 rounded-xl p-4 mb-4">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-sm text-gray-600">Podobných nabídek</Text>
                  <Text className="text-xl font-bold text-gray-900">{comparison.totalCount}</Text>
                </View>

                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-sm text-gray-600">Průměrná cena za m²</Text>
                  <Text className="text-base font-semibold text-gray-900">
                    {formatPrice(comparison.averagePricePerM2)}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-sm text-gray-600">Vaše cena za m²</Text>
                  <Text
                    className="text-base font-semibold"
                    style={{
                      color: property.pricePerM2 < comparison.averagePricePerM2 ? '#10b981' : '#ef4444'
                    }}
                  >
                    {formatPrice(property.pricePerM2)}
                    {property.pricePerM2 < comparison.averagePricePerM2 && ' ✓'}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600">Lepších nabídek</Text>
                  <Text className="text-base font-semibold text-gray-900">
                    {comparison.betterDealsCount} z {comparison.totalCount}
                  </Text>
                </View>
              </View>

              {/* Price Comparison Bar */}
              <View className="bg-gray-100 rounded-xl p-4 mb-4">
                <Text className="text-sm text-gray-600 mb-2">Cenové srovnání</Text>
                <View className="flex-row items-center">
                  <Text className="text-xs text-gray-500 mr-2">Nejlevnější</Text>
                  <View className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-blue-500"
                      style={{ width: `${comparison.pricePercentile}%` }}
                    />
                  </View>
                  <Text className="text-xs text-gray-500 ml-2">Nejdražší</Text>
                </View>
                <Text className="text-center text-xs text-gray-600 mt-2">
                  Tato nemovitost je levnější než {Math.round(comparison.pricePercentile)}% podobných nabídek
                </Text>
              </View>

              {/* Similar Properties */}
              {comparison.similarProperties.length > 0 && (
                <View>
                  <Text className="text-base font-semibold text-gray-900 mb-3">
                    Podobné nemovitosti v okolí (seřazeno podle ceny)
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                    {comparison.similarProperties.slice(0, 5).map((p) => (
                      <Pressable
                        key={p.id}
                        onPress={() => handleComparePropertyPress(p)}
                        className="mr-3 w-64 bg-white rounded-xl border border-gray-200 overflow-hidden"
                      >
                        <Image
                          source={{ uri: p.imageUrl }}
                          className="w-full h-32"
                          resizeMode="cover"
                        />
                        <View className="p-3">
                          <Text className="text-sm font-semibold text-gray-900 mb-1" numberOfLines={1}>
                            {p.title}
                          </Text>
                          <Text className="text-xs text-gray-500 mb-2" numberOfLines={1}>
                            {p.location}
                          </Text>
                          <View className="flex-row justify-between items-center">
                            <View>
                              <Text className="text-lg font-bold text-blue-600">
                                {formatPrice(p.price)}
                              </Text>
                              <Text className="text-xs text-gray-500">
                                {formatPrice(p.pricePerM2)}/m²
                              </Text>
                            </View>
                            <View
                              className="rounded-lg px-2 py-1"
                              style={{ backgroundColor: getRatingBackgroundColor(p.rating) }}
                            >
                              <Text
                                className="text-sm font-bold"
                                style={{ color: getRatingColor(p.rating) }}
                              >
                                {p.rating}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Source Info */}
          <View className="bg-gray-50 rounded-xl p-4 mb-6">
            <Text className="text-sm text-gray-600 mb-1">Zdroj</Text>
            <Text className="text-base font-semibold text-gray-900 capitalize">
              {property.source === "google_sheets" ? "Google Sheets" : `${property.source}.cz`}
            </Text>
          </View>

          {/* Open Source Button */}
          {property.sourceUrl && (
            <Pressable
              onPress={handleOpenSource}
              className="bg-blue-500 rounded-xl py-4 items-center mb-4"
            >
              <View className="flex-row items-center">
                <Text className="text-white text-lg font-semibold mr-2">
                  Zobrazit původní inzerát
                </Text>
                <Ionicons name="open-outline" size={20} color="white" />
              </View>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
