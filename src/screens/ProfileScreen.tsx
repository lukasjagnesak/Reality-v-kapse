import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useUserStore } from "../state/userStore";
import { SUBSCRIPTION_PLANS, type SubscriptionType } from "../types/user";
import { supabase } from "../api/supabase";

export default function ProfileScreen() {
  const { profile, clearProfile, updateProfileInDatabase } = useUserStore();

  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!fullName) {
      Alert.alert("Chyba", "Vyplňte prosím celé jméno");
      return;
    }

    setSaving(true);
    try {
      await updateProfileInDatabase({
        fullName,
        phone,
      });
      setIsEditing(false);
      Alert.alert("Uloženo", "Váš profil byl úspěšně aktualizován");
    } catch (error) {
      console.error("❌ Error saving profile:", error);
      Alert.alert("Chyba", "Nepodařilo se uložit profil. Zkuste to znovu.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to current profile values
    setFullName(profile?.fullName || "");
    setPhone(profile?.phone || "");
    setIsEditing(false);
  };

  const handleSubscriptionChange = (newSubscription: SubscriptionType) => {
    Alert.alert(
      "Změnit předplatné",
      `Opravdu chcete změnit předplatné na ${SUBSCRIPTION_PLANS[newSubscription].name}?`,
      [
        { text: "Zrušit", style: "cancel" },
        {
          text: "Potvrdit",
          onPress: async () => {
            try {
              await updateProfileInDatabase({ subscription: newSubscription });
              Alert.alert("Úspěch", "Vaše předplatné bylo změněno");
            } catch (error) {
              Alert.alert("Chyba", "Nepodařilo se změnit předplatné");
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Odhlásit se",
      "Opravdu se chcete odhlásit?",
      [
        { text: "Zrušit", style: "cancel" },
        {
          text: "Odhlásit",
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              clearProfile();
              console.log("✅ Odhlášení úspěšné");
            } catch (error) {
              console.error("❌ Chyba při odhlášení:", error);
              Alert.alert("Chyba", "Nepodařilo se odhlásit. Zkuste to znovu.");
            }
          },
        },
      ]
    );
  };

  const currentSubscription = profile?.subscription || "free";
  const currentPlan = SUBSCRIPTION_PLANS[currentSubscription];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <ScrollView className="flex-1">
        {/* Profile Section */}
        <View className="bg-white px-6 py-6 mb-2">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-900">
              Můj profil
            </Text>
            {!isEditing ? (
              <Pressable
                onPress={() => setIsEditing(true)}
                className="bg-blue-500 rounded-lg px-4 py-2"
              >
                <Text className="text-white font-semibold">Upravit</Text>
              </Pressable>
            ) : null}
          </View>

          {/* Profile Picture Placeholder */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="person" size={48} color="#3b82f6" />
            </View>
            {profile?.fullName && (
              <Text className="text-xl font-semibold text-gray-900">
                {profile.fullName}
              </Text>
            )}
            {profile?.email && (
              <Text className="text-sm text-gray-600 mt-1">
                {profile.email}
              </Text>
            )}
          </View>

          {/* Profile Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Celé jméno *
              </Text>
              <TextInput
                className={`bg-gray-100 rounded-lg px-4 py-3 text-base ${
                  !isEditing ? "text-gray-600" : "text-gray-900"
                }`}
                placeholder="Jan Novák"
                value={fullName}
                onChangeText={setFullName}
                editable={isEditing}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Email
              </Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-4 py-3 text-base text-gray-600"
                value={profile?.email || ""}
                editable={false}
              />
              <Text className="text-xs text-gray-500 mt-1">
                Email nelze změnit
              </Text>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Telefon
              </Text>
              <TextInput
                className={`bg-gray-100 rounded-lg px-4 py-3 text-base ${
                  !isEditing ? "text-gray-600" : "text-gray-900"
                }`}
                placeholder="+420 123 456 789"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={isEditing}
              />
            </View>

            {isEditing && (
              <View className="flex-row space-x-3 mt-4">
                <Pressable
                  onPress={handleCancel}
                  disabled={saving}
                  className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
                >
                  <Text className="text-gray-700 font-semibold">Zrušit</Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  disabled={saving}
                  className={`flex-1 bg-blue-500 rounded-lg py-3 items-center ${
                    saving ? "opacity-50" : ""
                  }`}
                >
                  {saving ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-semibold">Uložit</Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Current Subscription */}
        <View className="bg-white px-6 py-6 mb-2">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Aktuální předplatné
          </Text>

          <View className="bg-blue-50 rounded-xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-2xl font-bold text-blue-600">
                {currentPlan.name}
              </Text>
              {currentPlan.price > 0 && (
                <Text className="text-xl font-bold text-gray-900">
                  {currentPlan.price} Kč/měsíc
                </Text>
              )}
            </View>

            <View className="space-y-2">
              {currentPlan.features.map((feature, index) => (
                <View key={index} className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
                  <Text className="text-sm text-gray-700 ml-2">{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Available Plans */}
        <View className="bg-white px-6 py-6 mb-2">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Dostupná předplatná
          </Text>

          {(Object.keys(SUBSCRIPTION_PLANS) as SubscriptionType[]).map((planType) => {
            const plan = SUBSCRIPTION_PLANS[planType];
            const isCurrent = planType === currentSubscription;

            return (
              <View
                key={planType}
                className={`border-2 rounded-xl p-4 mb-3 ${
                  isCurrent ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </Text>
                  <Text className="text-lg font-bold text-gray-900">
                    {plan.price === 0 ? "Zdarma" : `${plan.price} Kč`}
                  </Text>
                </View>

                <View className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <View key={index} className="flex-row items-center">
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={18}
                        color="#6b7280"
                      />
                      <Text className="text-sm text-gray-600 ml-2">
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>

                {!isCurrent && (
                  <Pressable
                    onPress={() => handleSubscriptionChange(planType)}
                    className="bg-blue-500 rounded-lg py-3 items-center"
                  >
                    <Text className="text-white font-semibold">
                      Vybrat tento plán
                    </Text>
                  </Pressable>
                )}

                {isCurrent && (
                  <View className="bg-blue-500 rounded-lg py-3 items-center">
                    <Text className="text-white font-semibold">
                      Aktuální plán
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Account Actions */}
        <View className="bg-white px-6 py-6 mb-2">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Nastavení účtu
          </Text>

          <Pressable className="flex-row items-center justify-between py-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <Ionicons name="lock-closed-outline" size={24} color="#6b7280" />
              <Text className="text-base text-gray-900 ml-3">
                Změnit heslo
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6b7280" />
          </Pressable>

          <Pressable className="flex-row items-center justify-between py-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <Ionicons name="notifications-outline" size={24} color="#6b7280" />
              <Text className="text-base text-gray-900 ml-3">
                Notifikace
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6b7280" />
          </Pressable>

          <Pressable className="flex-row items-center justify-between py-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <Ionicons name="shield-outline" size={24} color="#6b7280" />
              <Text className="text-base text-gray-900 ml-3">
                Ochrana soukromí
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6b7280" />
          </Pressable>

          <Pressable className="flex-row items-center justify-between py-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <Ionicons name="help-circle-outline" size={24} color="#6b7280" />
              <Text className="text-base text-gray-900 ml-3">
                Nápověda a podpora
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6b7280" />
          </Pressable>

          {/* Logout Button */}
          <Pressable 
            onPress={handleLogout}
            className="flex-row items-center justify-between py-4"
          >
            <View className="flex-row items-center">
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
              <Text className="text-base text-red-500 ml-3 font-semibold">
                Odhlásit se
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ef4444" />
          </Pressable>
        </View>

        {/* Version Info */}
        <View className="px-6 py-4 items-center mb-8">
          <Text className="text-sm text-gray-500">Reality v Kapse</Text>
          <Text className="text-xs text-gray-400 mt-1">Verze 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
