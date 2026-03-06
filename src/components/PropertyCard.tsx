import React, { useEffect } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import type { Property } from "../types/property";
import { formatPrice } from "../utils/propertyUtils";
import { RatingBadge, DiscountBadge } from "./Badges";

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
  onFavoritePress: () => void;
  isFavorite: boolean;
  index?: number;
}

export function PropertyCard({
  property,
  onPress,
  onFavoritePress,
  isFavorite,
  index = 0,
}: PropertyCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(1);

  useEffect(() => {
    const delay = Math.min(index * 80, 400);
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    translateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const discountAmount = property.priceHistory
    ? property.priceHistory.oldPrice - property.priceHistory.newPrice
    : 0;

  return (
    <Animated.View style={[cardStyle, { marginHorizontal: 16, marginBottom: 16 }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: '#141420',
          borderRadius: 20,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.07)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {/* Image */}
        <View style={{ position: 'relative', height: 220 }}>
          <Image
            source={{ uri: property.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />

          {/* Gradient overlay bottom */}
          <LinearGradient
            colors={['transparent', 'rgba(20,20,32,0.95)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 }}
          />

          {/* Top badges */}
          <View style={{ position: 'absolute', top: 14, left: 14 }}>
            <RatingBadge rating={property.rating} />
          </View>
          <View style={{ position: 'absolute', top: 14, right: 14 }}>
            <DiscountBadge percentage={property.discountPercentage} />
          </View>

          {/* Favorite Button */}
          <Pressable
            onPress={onFavoritePress}
            style={{
              position: 'absolute', bottom: 14, right: 14,
              backgroundColor: isFavorite ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.4)',
              borderRadius: 20, padding: 8,
              borderWidth: 1,
              borderColor: isFavorite ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? "#ef4444" : "#ffffff"}
            />
          </Pressable>

          {/* Price overlay on image bottom */}
          <View style={{ position: 'absolute', bottom: 14, left: 14 }}>
            {property.priceHistory && property.priceHistory.newPrice < property.priceHistory.oldPrice && (
              <View style={{
                backgroundColor: 'rgba(16,185,129,0.2)',
                borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
                borderWidth: 1, borderColor: 'rgba(16,185,129,0.4)',
                marginBottom: 4,
              }}>
                <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '700' }}>
                  Sleva -{formatPrice(discountAmount)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={{ padding: 18 }}>
          {/* Title */}
          <Text
            style={{ fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 6, letterSpacing: -0.3 }}
            numberOfLines={2}
          >
            {property.title}
          </Text>

          {/* Location */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <Ionicons name="location" size={14} color="#6366f1" />
            <Text style={{ fontSize: 13, color: '#9ca3af', marginLeft: 5 }} numberOfLines={1}>
              {property.location}
            </Text>
          </View>

          {/* Stats row */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 12, padding: 12, marginBottom: 14,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
          }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: '600' }}>DISPOZICE</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#e5e7eb' }}>{property.disposition}</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: '600' }}>ROZLOHA</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#e5e7eb' }}>{property.area} m²</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: '600' }}>CENA/M²</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#e5e7eb' }}>{formatPrice(property.pricePerM2)}</Text>
            </View>
          </View>

          {/* Price */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              {property.priceHistory && (
                <Text style={{ fontSize: 13, color: '#6b7280', textDecorationLine: 'line-through', marginBottom: 2 }}>
                  {formatPrice(property.priceHistory.oldPrice)}
                </Text>
              )}
              <Text style={{ fontSize: 26, fontWeight: '800', color: '#6366f1', letterSpacing: -0.5 }}>
                {formatPrice(property.price)}
              </Text>
            </View>

            {property.isNew && !property.priceHistory && (
              <View style={{
                backgroundColor: 'rgba(16,185,129,0.15)',
                borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
                borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
              }}>
                <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '700' }}>NOVY</Text>
              </View>
            )}

            <View style={{
              backgroundColor: 'rgba(99,102,241,0.15)',
              borderRadius: 12, padding: 10,
              borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)',
            }}>
              <Ionicons name="chevron-forward" size={18} color="#6366f1" />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
