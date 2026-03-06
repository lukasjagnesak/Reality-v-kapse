import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { PropertyRating } from "../types/property";
import { getRatingColor, getRatingBackgroundColor } from "../utils/propertyUtils";

interface RatingBadgeProps {
  rating: PropertyRating;
  size?: "small" | "medium" | "large";
}

export function RatingBadge({ rating, size = "medium" }: RatingBadgeProps) {
  const padding = { small: { h: 8, v: 5 }, medium: { h: 12, v: 7 }, large: { h: 14, v: 9 } }[size];
  const fontSize = { small: 13, medium: 18, large: 22 }[size];
  const radius = { small: 8, medium: 10, large: 12 }[size];

  return (
    <View
      style={{
        backgroundColor: getRatingBackgroundColor(rating),
        borderRadius: radius,
        paddingHorizontal: padding.h,
        paddingVertical: padding.v,
        borderWidth: 1,
        borderColor: `${getRatingColor(rating)}40`,
        shadowColor: getRatingColor(rating),
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      }}
    >
      <Text style={{ fontSize, fontWeight: '800', color: getRatingColor(rating) }}>
        {rating}
      </Text>
    </View>
  );
}

interface DiscountBadgeProps {
  percentage: number;
  size?: "small" | "medium" | "large";
}

export function DiscountBadge({ percentage, size = "medium" }: DiscountBadgeProps) {
  const padding = { small: { h: 8, v: 5 }, medium: { h: 12, v: 7 }, large: { h: 14, v: 9 } }[size];
  const fontSize = { small: 11, medium: 13, large: 15 }[size];
  const radius = { small: 8, medium: 10, large: 12 }[size];

  return (
    <View
      style={{
        backgroundColor: 'rgba(239,68,68,0.2)',
        borderRadius: radius,
        paddingHorizontal: padding.h,
        paddingVertical: padding.v,
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.5)',
      }}
    >
      <Text style={{ fontSize, fontWeight: '800', color: '#ef4444' }}>
        -{percentage}%
      </Text>
    </View>
  );
}
