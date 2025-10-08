import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../api/supabase';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Chyba', 'Vyplňte prosím email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Chyba', 'Zadejte platný email');
      return;
    }

    setLoading(true);
    console.log('🔵 Odesílám reset hesla pro:', email);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'reality-v-kapse://reset-password', // Deep link pro mobilní aplikaci
      });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Email pro reset hesla odeslán');
      setEmailSent(true);
      
      Alert.alert(
        'Email odeslán!',
        `Poslali jsme vám odkaz pro reset hesla na adresu ${email}. Zkontrolujte si prosím emailovou schránku.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Chyba při resetu hesla:', error);
      const errorMessage = error.message || JSON.stringify(error);
      
      // User-friendly error messages
      let displayMessage = 'Nepodařilo se odeslat email pro reset hesla. Zkuste to znovu.';
      
      if (errorMessage.includes('Email not found') || errorMessage.includes('User not found')) {
        displayMessage = 'Tento email není registrován. Zkontrolujte prosím email nebo se zaregistrujte.';
      } else if (errorMessage.includes('rate limit')) {
        displayMessage = 'Příliš mnoho pokusů. Počkejte prosím chvíli a zkuste to znovu.';
      }
      
      Alert.alert('Chyba', displayMessage);
    } finally {
      setLoading(false);
    }
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
          {/* Back Button */}
          <View className="px-6 pt-4">
            <Pressable
              onPress={() => navigation.goBack()}
              className="flex-row items-center"
              disabled={loading}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
              <Text className="text-gray-700 ml-2">Zpět</Text>
            </Pressable>
          </View>

          <View className="flex-1 px-6 justify-center">
            {/* Icon */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="lock-closed" size={40} color="#3b82f6" />
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Zapomenuté heslo
              </Text>
              <Text className="text-gray-600 text-center">
                Zadejte svůj email a my vám pošleme odkaz pro obnovení hesla
              </Text>
            </View>

            {/* Email Input */}
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
                editable={!loading && !emailSent}
                autoFocus
              />
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleResetPassword}
              disabled={loading || emailSent}
              className={`bg-blue-500 rounded-lg py-4 items-center mb-4 ${
                (loading || emailSent) ? 'opacity-50' : ''
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : emailSent ? (
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text className="text-white font-semibold text-lg ml-2">Email odeslán</Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-lg">Odeslat odkaz</Text>
              )}
            </Pressable>

            {/* Info */}
            <View className="bg-blue-50 rounded-lg p-4">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <Text className="text-sm text-gray-700 ml-2 flex-1">
                  Odkaz pro reset hesla bude platný 1 hodinu. Pokud email nedorazí, zkontrolujte složku spam.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
