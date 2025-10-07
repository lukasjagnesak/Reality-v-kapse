import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useUserStore } from "../state/userStore";
import { SUBSCRIPTION_PLANS, type SubscriptionType } from "../types/user";

export default function ProfileScreen() {
  const { profile, setProfile, updateProfile, updateSubscription } = useUserStore();

  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile?.firstName || "");
  const [lastName, setLastName] = useState(profile?.lastName || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [phone, setPhone] = useState(profile?.phone || "");

  // Initialize profile if doesn't exist
  React.useEffect(() => {
    if (!profile) {
      setProfile({
        id: "demo-user-" + Date.now(),
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        createdAt: new Date(),
        subscription: "free",
      });
    }
  }, [profile, setProfile]);

  const handleSave = () => {
    if (!email || !firstName || !lastName) {
      Alert.alert("Chyba", "Vyplňte prosím všechna povinná pole");
      return;
    }

    updateProfile({
      firstName,
      lastName,
      email,
      phone,
    });
    setIsEditing(false);
    Alert.alert("Uloženo", "Váš profil byl úspěšně aktualizován");
  };

  const handleCancel = () => {
    // Reset to current profile values
    setFirstName(profile?.firstName || "");
    setLastName(profile?.lastName || "");
    setEmail(profile?.email || "");
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
          onPress: () => {
            updateSubscription(newSubscription);
            Alert.alert("Úspěch", "Vaše předplatné bylo změněno");
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
            {profile?.firstName && profile?.lastName && (
              <Text className="text-xl font-semibold text-gray-900">
                {profile.firstName} {profile.lastName}
              </Text>
            )}
          </View>

          {/* Profile Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Jméno *
              </Text>
              <TextInput
                className={`bg-gray-100 rounded-lg px-4 py-3 text-base ${
                  !isEditing ? "text-gray-600" : "text-gray-900"
                }`}
                placeholder="Zadejte jméno"
                value={firstName}
                onChangeText={setFirstName}
                editable={isEditing}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Příjmení *
              </Text>
              <TextInput
                className={`bg-gray-100 rounded-lg px-4 py-3 text-base ${
                  !isEditing ? "text-gray-600" : "text-gray-900"
                }`}
                placeholder="Zadejte příjmení"
                value={lastName}
                onChangeText={setLastName}
                editable={isEditing}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Email *
              </Text>
              <TextInput
                className={`bg-gray-100 rounded-lg px-4 py-3 text-base ${
                  !isEditing ? "text-gray-600" : "text-gray-900"
                }`}
                placeholder="vas@email.cz"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={isEditing}
              />
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
                  className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
                >
                  <Text className="text-gray-700 font-semibold">Zrušit</Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  className="flex-1 bg-blue-500 rounded-lg py-3 items-center"
                >
                  <Text className="text-white font-semibold">Uložit</Text>
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
        <View className="bg-white px-6 py-6 mb-4">
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

          <Pressable className="flex-row items-center justify-between py-4">
            <View className="flex-row items-center">
              <Ionicons name="help-circle-outline" size={24} color="#6b7280" />
              <Text className="text-base text-gray-900 ml-3">
                Nápověda a podpora
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6b7280" />
          </Pressable>
        </View>

        {/* Version Info */}
        <View className="px-6 py-4 items-center">
          <Text className="text-sm text-gray-500">Reality v Kapse</Text>
          <Text className="text-xs text-gray-400 mt-1">Verze 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
