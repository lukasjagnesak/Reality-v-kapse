import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useUserStore } from "../state/userStore";
import { SUBSCRIPTION_PLANS, type SubscriptionType } from "../types/user";
import { supabase } from "../api/supabase";

export default function ProfileScreen() {
  const { profile, clearProfile, updateProfileInDatabase } = useUserStore();
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
      await updateProfileInDatabase({ fullName, phone });
      setIsEditing(false);
      Alert.alert("Uloženo", "Váš profil byl úspěšně aktualizován");
    } catch (error) {
      Alert.alert("Chyba", "Nepodařilo se uložit profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
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
            } catch {
              Alert.alert("Chyba", "Nepodařilo se změnit předplatné");
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Odhlásit se", "Opravdu se chcete odhlásit?", [
      { text: "Zrušit", style: "cancel" },
      {
        text: "Odhlásit",
        style: "destructive",
        onPress: async () => {
          try {
            await supabase.auth.signOut();
            clearProfile();
          } catch {
            Alert.alert("Chyba", "Nepodařilo se odhlásit.");
          }
        },
      },
    ]);
  };

  const currentSubscription = profile?.subscription || "free";
  const currentPlan = SUBSCRIPTION_PLANS[currentSubscription];

  const SettingsRow = ({ icon, label, color, onPress }: { icon: string; label: string; color?: string; onPress?: () => void }) => (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          backgroundColor: color ? `${color}20` : 'rgba(255,255,255,0.08)',
          borderRadius: 10, padding: 8, marginRight: 14,
        }}>
          <Ionicons name={icon as any} size={20} color={color || '#9ca3af'} />
        </View>
        <Text style={{ color: color || '#e5e7eb', fontSize: 15, fontWeight: '500' }}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={color || '#4b5563'} />
    </Pressable>
  );

  const InputField = ({ label, value, onChange, placeholder, editable = true, keyboardType }: any) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 }}>
        {label}
      </Text>
      <View style={{
        backgroundColor: editable && isEditing ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: editable && isEditing ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)',
        paddingHorizontal: 16,
      }}>
        <TextInput
          style={{ color: editable ? '#ffffff' : '#6b7280', paddingVertical: 14, fontSize: 15 }}
          placeholder={placeholder}
          placeholderTextColor="#4b5563"
          value={value}
          onChangeText={onChange}
          editable={editable && isEditing}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* Header with avatar */}
        <LinearGradient
          colors={['#1a1040', '#0A0A0F']}
          style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 }}
        >
          <View style={{ alignItems: 'center' }}>
            <LinearGradient
              colors={['#6366f1', '#3b82f6']}
              style={{
                width: 90, height: 90, borderRadius: 28,
                alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                shadowColor: '#6366f1', shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
              }}
            >
              <Ionicons name="person" size={44} color="white" />
            </LinearGradient>
            {profile?.fullName && (
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#ffffff', letterSpacing: -0.3, marginBottom: 4 }}>
                {profile.fullName}
              </Text>
            )}
            {profile?.email && (
              <Text style={{ color: '#9ca3af', fontSize: 14 }}>{profile.email}</Text>
            )}

            {/* Subscription badge */}
            <View style={{
              marginTop: 12,
              backgroundColor: 'rgba(99,102,241,0.2)',
              borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6,
              borderWidth: 1, borderColor: 'rgba(99,102,241,0.4)',
              flexDirection: 'row', alignItems: 'center',
            }}>
              <Ionicons name="star" size={14} color="#818cf8" style={{ marginRight: 6 }} />
              <Text style={{ color: '#818cf8', fontWeight: '700', fontSize: 13 }}>
                {currentPlan.name}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20 }}>

          {/* Profile Card */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 20, padding: 20, marginBottom: 16,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#ffffff' }}>Můj profil</Text>
              {!isEditing ? (
                <Pressable
                  onPress={() => setIsEditing(true)}
                  style={{
                    backgroundColor: 'rgba(99,102,241,0.2)',
                    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8,
                    borderWidth: 1, borderColor: 'rgba(99,102,241,0.4)',
                    flexDirection: 'row', alignItems: 'center',
                  }}
                >
                  <Ionicons name="pencil" size={14} color="#818cf8" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#818cf8', fontWeight: '600', fontSize: 14 }}>Upravit</Text>
                </Pressable>
              ) : null}
            </View>

            <InputField label="CELÉ JMÉNO" value={fullName} onChange={setFullName} placeholder="Jan Novák" />
            <InputField label="EMAIL" value={profile?.email || ""} editable={false} placeholder="email" />
            <InputField label="TELEFON" value={phone} onChange={setPhone} placeholder="+420 123 456 789" keyboardType="phone-pad" />

            {isEditing && (
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <Pressable
                  onPress={handleCancel}
                  disabled={saving}
                  style={{
                    flex: 1, backgroundColor: 'rgba(255,255,255,0.06)',
                    borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginRight: 10,
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Text style={{ color: '#9ca3af', fontWeight: '600' }}>Zrušit</Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  disabled={saving}
                  style={{ flex: 1, borderRadius: 14, overflow: 'hidden', opacity: saving ? 0.6 : 1 }}
                >
                  <LinearGradient
                    colors={['#6366f1', '#3b82f6']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={{ paddingVertical: 14, alignItems: 'center' }}
                  >
                    {saving ? <ActivityIndicator color="white" size="small" /> : (
                      <Text style={{ color: 'white', fontWeight: '700' }}>Uložit</Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          </View>

          {/* Current Subscription */}
          <View style={{
            borderRadius: 20, marginBottom: 16, overflow: 'hidden',
          }}>
            <LinearGradient
              colors={['rgba(99,102,241,0.25)', 'rgba(59,130,246,0.15)']}
              style={{
                padding: 20,
                borderWidth: 1, borderColor: 'rgba(99,102,241,0.35)',
                borderRadius: 20,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#ffffff' }}>Aktuální plán</Text>
                <Text style={{ color: '#9ca3af', fontSize: 15, fontWeight: '600' }}>
                  {currentPlan.price === 0 ? 'Zdarma' : `${currentPlan.price} Kč/mes.`}
                </Text>
              </View>
              {currentPlan.features.map((feature, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ backgroundColor: 'rgba(99,102,241,0.3)', borderRadius: 8, padding: 3, marginRight: 10 }}>
                    <Ionicons name="checkmark" size={14} color="#818cf8" />
                  </View>
                  <Text style={{ color: '#c4b5fd', fontSize: 14 }}>{feature}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>

          {/* Available Plans */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 20, padding: 20, marginBottom: 16,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 16 }}>
              Dostupná předplatná
            </Text>
            {(Object.keys(SUBSCRIPTION_PLANS) as SubscriptionType[]).map((planType) => {
              const plan = SUBSCRIPTION_PLANS[planType];
              const isCurrent = planType === currentSubscription;
              return (
                <View
                  key={planType}
                  style={{
                    borderRadius: 16, padding: 16, marginBottom: 12,
                    backgroundColor: isCurrent ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                    borderWidth: 1,
                    borderColor: isCurrent ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)',
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{ fontSize: 17, fontWeight: '700', color: isCurrent ? '#818cf8' : '#ffffff' }}>
                      {plan.name}
                    </Text>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: isCurrent ? '#818cf8' : '#9ca3af' }}>
                      {plan.price === 0 ? "Zdarma" : `${plan.price} Kč`}
                    </Text>
                  </View>
                  <View style={{ marginBottom: 14 }}>
                    {plan.features.map((feature, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Ionicons name={isCurrent ? "checkmark-circle" : "checkmark-circle-outline"} size={16}
                          color={isCurrent ? '#818cf8' : '#4b5563'} style={{ marginRight: 8 }} />
                        <Text style={{ color: isCurrent ? '#c4b5fd' : '#6b7280', fontSize: 13 }}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  {!isCurrent ? (
                    <Pressable
                      onPress={() => handleSubscriptionChange(planType)}
                      style={{ borderRadius: 12, overflow: 'hidden' }}
                    >
                      <LinearGradient
                        colors={['#6366f1', '#3b82f6']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={{ paddingVertical: 12, alignItems: 'center' }}
                      >
                        <Text style={{ color: 'white', fontWeight: '700' }}>Vybrat tento plán</Text>
                      </LinearGradient>
                    </Pressable>
                  ) : (
                    <View style={{
                      backgroundColor: 'rgba(99,102,241,0.2)',
                      borderRadius: 12, paddingVertical: 12, alignItems: 'center',
                    }}>
                      <Text style={{ color: '#818cf8', fontWeight: '700' }}>Aktuální plán</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Settings */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8, marginBottom: 16,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#ffffff', paddingVertical: 16 }}>
              Nastavení účtu
            </Text>
            <SettingsRow icon="lock-closed-outline" label="Změnit heslo" />
            <SettingsRow icon="notifications-outline" label="Notifikace" />
            <SettingsRow icon="shield-outline" label="Ochrana soukromí" />
            <SettingsRow icon="help-circle-outline" label="Nápověda a podpora" />
            <SettingsRow icon="log-out-outline" label="Odhlásit se" color="#ef4444" onPress={handleLogout} />
          </View>

          {/* Version */}
          <View style={{ alignItems: 'center', paddingVertical: 20, marginBottom: 20 }}>
            <Text style={{ color: '#374151', fontSize: 13 }}>Reality v Kapse · Verze 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
