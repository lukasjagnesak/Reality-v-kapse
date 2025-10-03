import React from "react";
import { View, Text } from "react-native";
import type { PropertyRating } from "../types/property";
import { getRatingColor, getRatingBackgroundColor } from "../utils/propertyUtils";

interface RatingBadgeProps {
  rating: PropertyRating;
  size?: "small" | "medium" | "large";
}

export function RatingBadge({ rating, size = "medium" }: RatingBadgeProps) {
  const sizeClasses = {
    small: "px-2 py-1",
    medium: "px-3 py-1.5",
    large: "px-4 py-2",
  };

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-lg",
    large: "text-2xl",
  };

  return (
    <View
      className={`rounded-lg ${sizeClasses[size]}`}
      style={{
        backgroundColor: getRatingBackgroundColor(rating),
      }}
    >
      <Text
        className={`${textSizeClasses[size]} font-bold`}
        style={{ color: getRatingColor(rating) }}
      >
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
  const sizeClasses = {
    small: "px-2 py-1",
    medium: "px-3 py-1.5",
    large: "px-4 py-2",
  };

  const textSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  };

  return (
    <View className={`bg-red-500 rounded-lg ${sizeClasses[size]}`}>
      <Text className={`text-white ${textSizeClasses[size]} font-bold`}>
        -{percentage}%
      </Text>
    </View>
  );
}
