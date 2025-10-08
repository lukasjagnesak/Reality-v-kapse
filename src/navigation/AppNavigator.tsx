import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, ActivityIndicator } from "react-native";
import type { Property } from "../types/property";
import { usePropertyStore } from "../state/propertyStore";
import { useUserStore } from "../state/userStore";
import { supabase } from "../api/supabase";

// Import screens
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import PropertiesScreen from "../screens/PropertiesScreen";
import CriteriaScreen from "../screens/CriteriaScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PropertyDetailScreen from "../screens/PropertyDetailScreen";
import FavoritesScreen from "../screens/FavoritesScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
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
  const { isLoggedIn, setProfile, clearProfile } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>("Login");

  useEffect(() => {
    // Check initial auth state
    const checkAuthState = async () => {
      try {
        console.log('🔍 Kontroluji auth state...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Chyba při načítání session:', error);
          // Na chybu reaguj, ale nepřeruš aplikaci
          setInitialRoute("Login");
          setIsLoading(false);
          return;
        }
        
        console.log('📊 Session:', session ? `User: ${session.user.id}` : 'Žádná session');
        
        if (session?.user) {
          console.log('✅ Uživatel je přihlášený');
          // User is logged in, fetch their profile
          const { data: profile, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileError) {
            console.error('❌ Chyba při načítání profilu:', profileError);
            // Profile doesn't exist yet - continue anyway
          }

          if (profile) {
            console.log('✅ Profil načten:', profile.email);
            setProfile({
              id: profile.id,
              email: profile.email,
              fullName: profile.full_name || "",
              phone: profile.phone || "",
              subscription: profile.subscription_type,
            });
          } else {
            console.log('⚠️ Profil neexistuje, ale uživatel je autentizován');
            // Set minimal profile from auth user
            setProfile({
              id: session.user.id,
              email: session.user.email || "",
              fullName: "",
              phone: "",
              subscription: "free",
            });
          }

          // Check if user has completed onboarding
          if (!hasCompletedSetup) {
            console.log('➡️ Přesměrování na Onboarding');
            setInitialRoute("Onboarding");
          } else {
            console.log('➡️ Přesměrování na MainTabs');
            setInitialRoute("MainTabs");
          }
        } else {
          console.log('➡️ Žádný přihlášený uživatel, přesměrování na Login');
          setInitialRoute("Login");
        }
      } catch (error) {
        console.error("❌ Neočekávaná chyba při checkAuthState:", error);
        setInitialRoute("Login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 Auth state změna:", event);

      if (event === "SIGNED_IN" && session?.user) {
        console.log('✅ Uživatel se přihlásil:', session.user.id);
        // User just signed in
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setProfile({
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name || "",
            phone: profile.phone || "",
            subscription: profile.subscription_type,
          });
        } else {
          // Create minimal profile
          setProfile({
            id: session.user.id,
            email: session.user.email || "",
            fullName: "",
            phone: "",
            subscription: "free",
          });
        }
      } else if (event === "SIGNED_OUT") {
        console.log('✅ Uživatel se odhlásil');
        // User signed out
        clearProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [hasCompletedSetup]);

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

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
        name="ForgotPassword"
        component={ForgotPasswordScreen}
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
