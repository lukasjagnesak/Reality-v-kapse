import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../api/supabase';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    // Validace
    if (!email || !password || !fullName) {
      Alert.alert('Chyba', 'Vyplňte prosím všechna pole');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Chyba', 'Heslo musí mít alespoň 6 znaků');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Chyba', 'Hesla se neshodují');
      return;
    }

    setLoading(true);
    try {
      // Registrace uživatele
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        Alert.alert(
          'Registrace úspěšná!',
          'Váš účet byl vytvořen. Nyní se můžete přihlásit.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('❌ Chyba registrace:', error);
      Alert.alert(
        'Chyba registrace',
        error.message === 'User already registered'
          ? 'Tento email je již registrován'
          : 'Nepodařilo se vytvořit účet. Zkuste to znovu.'
      );
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
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
              <Text className="text-gray-700 ml-2">Zpět</Text>
            </Pressable>
          </View>

          <View className="flex-1 px-6 justify-center">
            {/* Header */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Vytvořit účet
              </Text>
              <Text className="text-gray-600">
                Zaregistrujte se a začněte hledat svůj nový domov
              </Text>
            </View>

            {/* Register Form */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Celé jméno
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                placeholder="Jan Novák"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            <View className="mb-4">
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

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Heslo</Text>
              <View className="relative">
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 pr-12 text-gray-900"
                  placeholder="Alespoň 6 znaků"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
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

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Potvrdit heslo
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                placeholder="Zadejte heslo znovu"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Register Button */}
            <Pressable
              onPress={handleRegister}
              disabled={loading}
              className={`bg-blue-500 rounded-lg py-4 items-center mb-4 ${
                loading ? 'opacity-50' : ''
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Zaregistrovat se
                </Text>
              )}
            </Pressable>

            {/* Terms */}
            <Text className="text-xs text-gray-500 text-center">
              Registrací souhlasíte s našimi{' '}
              <Text className="text-blue-500">podmínkami použití</Text> a{' '}
              <Text className="text-blue-500">zásadami ochrany osobních údajů</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
