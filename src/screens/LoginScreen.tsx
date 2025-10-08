import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../api/supabase';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { usePropertyStore } from '../state/propertyStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// DEBUG MODE - Umožní přeskočit autentizaci
const DEBUG_MODE = true;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const completeSetup = usePropertyStore((state) => state.completeSetup);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleDebugSkip = () => {
    Alert.alert(
      'DEBUG MODE',
      'Přeskočit přihlášení a jít rovnou do aplikace?',
      [
        { text: 'Zrušit', style: 'cancel' },
        {
          text: 'Přeskočit na Onboarding',
          onPress: () => {
            console.log('🐛 DEBUG: Přeskok na Onboarding');
            navigation.replace('Onboarding');
          },
        },
        {
          text: 'Přeskočit do aplikace',
          onPress: () => {
            console.log('🐛 DEBUG: Přeskok do aplikace');
            completeSetup();
            navigation.replace('MainTabs');
          },
        },
      ]
    );
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Chyba', 'Vyplňte prosím email a heslo');
      return;
    }

    setLoading(true);
    console.log('🔵 Začínám přihlášení...');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      console.log('📊 Supabase odpověď:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      if (data.user) {
        console.log('✅ Přihlášení úspěšné, user:', data.user.id);
        console.log('✅ Session:', data.session ? 'ANO' : 'NE');
      }
    } catch (error: any) {
      console.error('❌ Chyba přihlášení:', error);
      const errorMessage = error.message || JSON.stringify(error);
      Alert.alert(
        'Chyba přihlášení',
        errorMessage.includes('Invalid login credentials')
          ? 'Nesprávný email nebo heslo'
          : `${errorMessage}\n\nZkuste to znovu.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 justify-center">
            {/* Logo / Header */}
            <View className="items-center mb-12">
              <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
                <Ionicons name="home" size={40} color="white" />
              </View>
              <Text className="text-3xl font-bold text-gray-900">Reality v Kapse</Text>
              <Text className="text-gray-600 mt-2">Najděte svůj nový domov</Text>
            </View>

            {/* Login Form */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                placeholder="vas@email.cz"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Heslo</Text>
              <View className="relative">
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 pr-12 text-gray-900"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  editable={!loading}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3"
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color="#9ca3af"
                  />
                </Pressable>
              </View>
            </View>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              className={`bg-blue-500 rounded-lg py-4 items-center mb-4 ${
                loading ? 'opacity-50' : ''
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-lg">Přihlásit se</Text>
              )}
            </Pressable>

            {/* Register Link */}
            <View className="flex-row items-center justify-center mb-4">
              <Text className="text-gray-600">Ještě nemáte účet? </Text>
              <Pressable onPress={handleRegister} disabled={loading}>
                <Text className="text-blue-500 font-semibold">Zaregistrujte se</Text>
              </Pressable>
            </View>

            {/* Forgot Password Link */}
            <View className="items-center mb-4">
              <Pressable onPress={() => navigation.navigate('ForgotPassword')} disabled={loading}>
                <Text className="text-blue-500 font-semibold">Zapomněli jste heslo?</Text>
              </Pressable>
            </View>

            {/* DEBUG MODE Button */}
            {DEBUG_MODE && (
              <Pressable
                onPress={handleDebugSkip}
                className="bg-orange-500 rounded-lg py-3 items-center mt-4"
              >
                <Text className="text-white font-semibold">
                  🐛 DEBUG: Přeskočit přihlášení
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
