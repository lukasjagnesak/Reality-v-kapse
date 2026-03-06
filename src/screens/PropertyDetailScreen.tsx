import React, { useEffect } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

type PropertyDetailRouteProp = RouteProp<RootStackParamList, "PropertyDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PropertyDetailScreen() {
  const route = useRoute<PropertyDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { property } = route.params;
  const { toggleFavorite, isFavorite, currentInterestRate, properties } = usePropertyStore();

  const downPaymentPercent = 20;
  const loanTermYears = 30;
  const mortgage = calculateMortgage(property.price, downPaymentPercent, currentInterestRate, loanTermYears);
  const locationInfo = parseLocation(property.location);
  const comparison = getMicroLocationComparison(property, properties);

  const imageOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  useEffect(() => {
    imageOpacity.value = withTiming(1, { duration: 500 });
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    contentTranslateY.value = withDelay(200, withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }));
  }, []);

  const imageStyle = useAnimatedStyle(() => ({ opacity: imageOpacity.value }));
  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const fav = isFavorite(property.id);

  const InfoRow = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
    }}>
      <Text style={{ color: '#9ca3af', fontSize: 14 }}>{label}</Text>
      <Text style={{ color: highlight ? '#10b981' : '#ffffff', fontSize: 15, fontWeight: '600' }}>{value}</Text>
    </View>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={{ fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 16, letterSpacing: -0.3 }}>
      {title}
    </Text>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <Animated.View style={[{ height: 320, position: 'relative' }, imageStyle]}>
          <Image
            source={{ uri: property.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(10,10,15,0.98)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160 }}
          />
          <LinearGradient
            colors={['rgba(10,10,15,0.6)', 'transparent']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100 }}
          />

          {/* Rating Badge */}
          <View
            style={{
              position: 'absolute', top: 16, left: 16,
              backgroundColor: getRatingBackgroundColor(property.rating),
              borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: '800', color: getRatingColor(property.rating) }}>
              {property.rating}
            </Text>
          </View>

          {/* Discount Badge */}
          <View style={{
            position: 'absolute', top: 16, right: 16,
            backgroundColor: 'rgba(239,68,68,0.2)',
            borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
            borderWidth: 1, borderColor: 'rgba(239,68,68,0.5)',
          }}>
            <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: '800' }}>
              -{property.discountPercentage}%
            </Text>
          </View>

          {/* Favorite Button */}
          <Pressable
            onPress={() => toggleFavorite(property.id)}
            style={{
              position: 'absolute', bottom: 16, right: 16,
              backgroundColor: fav ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.5)',
              borderRadius: 22, padding: 12,
              borderWidth: 1,
              borderColor: fav ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.2)',
            }}
          >
            <Ionicons name={fav ? "heart" : "heart-outline"} size={26} color={fav ? "#ef4444" : "#ffffff"} />
          </Pressable>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[{ paddingHorizontal: 20, paddingTop: 8 }, contentAnimStyle]}>

          {/* Title & Location */}
          <Text style={{ fontSize: 26, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5, marginBottom: 8, lineHeight: 32 }}>
            {property.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <Ionicons name="location" size={16} color="#6366f1" />
            <Text style={{ color: '#9ca3af', fontSize: 15, marginLeft: 6 }}>{property.location}</Text>
          </View>

          {/* Price Card */}
          <LinearGradient
            colors={['rgba(99,102,241,0.2)', 'rgba(59,130,246,0.1)']}
            style={{
              borderRadius: 20, padding: 20, marginBottom: 20,
              borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)',
            }}
          >
            <Text style={{ color: '#818cf8', fontSize: 13, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 }}>
              CELKOVA CENA
            </Text>
            {property.priceHistory && (
              <Text style={{ color: '#6b7280', fontSize: 16, textDecorationLine: 'line-through', marginBottom: 4 }}>
                {formatPrice(property.priceHistory.oldPrice)}
              </Text>
            )}
            <Text style={{ fontSize: 38, fontWeight: '800', color: '#ffffff', letterSpacing: -1 }}>
              {formatPrice(property.price)}
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 6 }}>
              {formatPrice(property.pricePerM2)} za m²
            </Text>
          </LinearGradient>

          {/* Key Stats */}
          <View style={{ flexDirection: 'row', marginBottom: 20 }}>
            {[
              { label: 'Dispozice', value: property.disposition },
              { label: 'Rozloha', value: `${property.area} m²` },
              { label: 'Typ', value: property.type },
            ].map((stat, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderRadius: 16, padding: 14,
                  marginRight: i < 2 ? 10 : 0,
                  alignItems: 'center',
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
                }}
              >
                <Text style={{ color: '#6b7280', fontSize: 11, fontWeight: '600', marginBottom: 6 }}>
                  {stat.label.toUpperCase()}
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#ffffff' }}>{stat.value}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 20, padding: 20, marginBottom: 20,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
          }}>
            <SectionHeader title="Popis" />
            <Text style={{ color: '#9ca3af', fontSize: 15, lineHeight: 24 }}>
              {property.description}
            </Text>
          </View>

          {/* Mortgage Calculator */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 20, padding: 20, marginBottom: 20,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
          }}>
            <SectionHeader title="Kalkulace hypoteky" />

            <LinearGradient
              colors={['rgba(16,185,129,0.2)', 'rgba(5,150,105,0.1)']}
              style={{
                borderRadius: 16, padding: 18, marginBottom: 16,
                borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
              }}
            >
              <Text style={{ color: '#6ee7b7', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
                MESICNI SPLATKA
              </Text>
              <Text style={{ fontSize: 32, fontWeight: '800', color: '#ffffff', letterSpacing: -1 }}>
                {formatPrice(mortgage.monthlyPayment)}
              </Text>
              <Text style={{ color: '#6ee7b7', fontSize: 13, marginTop: 6 }}>
                {currentInterestRate}% urok · {loanTermYears} let
              </Text>
            </LinearGradient>

            <InfoRow label={`Akontace (${downPaymentPercent}%)`} value={formatPrice(mortgage.downPayment)} />
            <InfoRow label="Vyse uveru" value={formatPrice(mortgage.loanAmount)} />
            <InfoRow label="Celkem zaplatite" value={formatPrice(mortgage.totalPaid + mortgage.downPayment)} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14 }}>
              <Text style={{ color: '#9ca3af', fontSize: 14 }}>Celkem na urocich</Text>
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
                {formatPrice(mortgage.totalInterest)}
              </Text>
            </View>
          </View>

          {/* Agent Contact */}
          {property.agent && (
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 20, padding: 20, marginBottom: 20,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
            }}>
              <SectionHeader title="Kontakt na makléře" />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <LinearGradient
                  colors={['#6366f1', '#3b82f6']}
                  style={{
                    width: 52, height: 52, borderRadius: 16,
                    alignItems: 'center', justifyContent: 'center', marginRight: 14,
                  }}
                >
                  <Ionicons name="person" size={24} color="white" />
                </LinearGradient>
                <View>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: '#ffffff' }}>
                    {property.agent.name}
                  </Text>
                  {property.agent.company && (
                    <Text style={{ color: '#6b7280', fontSize: 14, marginTop: 2 }}>
                      {property.agent.company}
                    </Text>
                  )}
                </View>
              </View>

              {property.agent.phone && (
                <Pressable
                  onPress={() => Linking.openURL(`tel:${property.agent?.phone?.replace(/\s/g, "")}`)}
                  style={{
                    backgroundColor: 'rgba(16,185,129,0.12)',
                    borderRadius: 14, padding: 16, marginBottom: 10,
                    flexDirection: 'row', alignItems: 'center',
                    borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)',
                  }}
                >
                  <View style={{ backgroundColor: 'rgba(16,185,129,0.2)', borderRadius: 10, padding: 8, marginRight: 12 }}>
                    <Ionicons name="call" size={18} color="#10b981" />
                  </View>
                  <Text style={{ color: '#10b981', fontWeight: '600', flex: 1, fontSize: 15 }}>
                    {property.agent.phone}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#10b981" />
                </Pressable>
              )}

              {property.agent.email && (
                <Pressable
                  onPress={() => Linking.openURL(`mailto:${property.agent?.email}`)}
                  style={{
                    backgroundColor: 'rgba(99,102,241,0.12)',
                    borderRadius: 14, padding: 16,
                    flexDirection: 'row', alignItems: 'center',
                    borderWidth: 1, borderColor: 'rgba(99,102,241,0.25)',
                  }}
                >
                  <View style={{ backgroundColor: 'rgba(99,102,241,0.2)', borderRadius: 10, padding: 8, marginRight: 12 }}>
                    <Ionicons name="mail" size={18} color="#818cf8" />
                  </View>
                  <Text style={{ color: '#818cf8', fontWeight: '600', flex: 1, fontSize: 15 }}>
                    {property.agent.email}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#818cf8" />
                </Pressable>
              )}
            </View>
          )}

          {/* MicroLocation Comparison */}
          {comparison.totalCount > 0 && (
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 20, padding: 20, marginBottom: 20,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
            }}>
              <SectionHeader title={`Porovnání v ${locationInfo.microLocation || locationInfo.district || locationInfo.city}`} />

              <View style={{
                backgroundColor: 'rgba(99,102,241,0.1)',
                borderRadius: 16, padding: 16, marginBottom: 14,
                borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)',
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ color: '#9ca3af', fontSize: 14 }}>Podobných nabídek</Text>
                  <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 16 }}>{comparison.totalCount}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ color: '#9ca3af', fontSize: 14 }}>Průměrná cena za m²</Text>
                  <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 15 }}>
                    {formatPrice(comparison.averagePricePerM2)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ color: '#9ca3af', fontSize: 14 }}>Vaše cena za m²</Text>
                  <Text style={{
                    fontWeight: '600', fontSize: 15,
                    color: property.pricePerM2 < comparison.averagePricePerM2 ? '#10b981' : '#ef4444',
                  }}>
                    {formatPrice(property.pricePerM2)}
                    {property.pricePerM2 < comparison.averagePricePerM2 ? ' ✓' : ''}
                  </Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 12, padding: 14, marginBottom: 14,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ color: '#6b7280', fontSize: 12 }}>Nejlevnejsi</Text>
                  <Text style={{ color: '#6b7280', fontSize: 12 }}>Nejdrazsi</Text>
                </View>
                <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                  <LinearGradient
                    colors={['#6366f1', '#3b82f6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ height: '100%', width: `${comparison.pricePercentile}%`, borderRadius: 4 }}
                  />
                </View>
                <Text style={{ color: '#818cf8', fontSize: 13, fontWeight: '600', marginTop: 10, textAlign: 'center' }}>
                  Levnější než {Math.round(comparison.pricePercentile)}% podobných nabídek
                </Text>
              </View>

              {comparison.similarProperties.length > 0 && (
                <View>
                  <Text style={{ color: '#e5e7eb', fontSize: 15, fontWeight: '600', marginBottom: 14 }}>
                    Podobné nemovitosti v okolí
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
                    {comparison.similarProperties.slice(0, 5).map((p) => (
                      <Pressable
                        key={p.id}
                        onPress={() => navigation.push("PropertyDetail", { property: p })}
                        style={{
                          width: 200, marginRight: 12,
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          borderRadius: 16, overflow: 'hidden',
                          borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <Image source={{ uri: p.imageUrl }} style={{ width: '100%', height: 110 }} resizeMode="cover" />
                        <View style={{ padding: 12 }}>
                          <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 13, marginBottom: 4 }} numberOfLines={1}>
                            {p.title}
                          </Text>
                          <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }} numberOfLines={1}>
                            {p.location}
                          </Text>
                          <Text style={{ color: '#6366f1', fontWeight: '700', fontSize: 16 }}>
                            {formatPrice(p.price)}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Source */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16,
            flexDirection: 'row', alignItems: 'center',
          }}>
            <Ionicons name="information-circle-outline" size={16} color="#6b7280" style={{ marginRight: 8 }} />
            <Text style={{ color: '#6b7280', fontSize: 13 }}>
              Zdroj: {property.source === "google_sheets" ? "Google Sheets" : `${property.source}.cz`}
            </Text>
          </View>

          {/* Open Source Button */}
          {property.sourceUrl && (
            <Pressable
              onPress={() => Linking.openURL(property.sourceUrl)}
              style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 40 }}
            >
              <LinearGradient
                colors={['#6366f1', '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
              >
                <Text style={{ color: 'white', fontSize: 17, fontWeight: '700', marginRight: 8 }}>
                  Zobrazit původní inzerát
                </Text>
                <Ionicons name="open-outline" size={20} color="white" />
              </LinearGradient>
            </Pressable>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
