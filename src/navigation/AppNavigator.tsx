import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { Property } from "../types/property";
import { usePropertyStore } from "../state/propertyStore";

// Import screens
import OnboardingScreen from "../screens/OnboardingScreen";
import HomeScreen from "../screens/HomeScreen";
import PropertyDetailScreen from "../screens/PropertyDetailScreen";
import SettingsScreen from "../screens/SettingsScreen";
import FavoritesScreen from "../screens/FavoritesScreen";

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  PropertyDetail: { property: Property };
  Settings: undefined;
  Favorites: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const hasCompletedSetup = usePropertyStore((state) => state.hasCompletedSetup);

  return (
    <Stack.Navigator
      initialRouteName={hasCompletedSetup ? "Home" : "Onboarding"}
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: false,
        headerBlurEffect: "systemChromeMaterial",
      }}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Reality v Kapse",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="PropertyDetail"
        component={PropertyDetailScreen}
        options={{
          title: "Detail nemovitosti",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Nastavení",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: "Oblíbené",
        }}
      />
    </Stack.Navigator>
  );
}
