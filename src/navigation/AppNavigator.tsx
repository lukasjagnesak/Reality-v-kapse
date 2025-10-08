import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import type { Property } from "../types/property";
import { usePropertyStore } from "../state/propertyStore";

// Import screens
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import PropertiesScreen from "../screens/PropertiesScreen";
import CriteriaScreen from "../screens/CriteriaScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PropertyDetailScreen from "../screens/PropertyDetailScreen";
import FavoritesScreen from "../screens/FavoritesScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  PropertyDetail: { property: Property };
  Favorites: undefined;
};

export type MainTabsParamList = {
  Properties: undefined;
  Criteria: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerLargeTitle: true,
        headerTransparent: false,
        headerBlurEffect: "systemChromeMaterial",
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Properties") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Criteria") {
            iconName = focused ? "options" : "options-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Properties"
        component={PropertiesScreen}
        options={{
          title: "Nemovitosti",
        }}
      />
      <Tab.Screen
        name="Criteria"
        component={CriteriaScreen}
        options={{
          title: "Kritéria",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Nastavení",
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const hasCompletedSetup = usePropertyStore((state) => state.hasCompletedSetup);
  
  // Pro teď začínáme vždy na Login (později přidáme auth state check)
  const initialRoute = "Login";

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
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
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: "Oblíbené",
        }}
      />
    </Stack.Navigator>
  );
}
