import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { supabase } from '../api/supabase';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const formOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) });
    formOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

  const handleRegister = async () => {
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
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { full_name: fullName }, emailRedirectTo: undefined },
      });
      if (error) throw error;
      if (data.user) {
        if (data.session) {
          Alert.alert('Registrace úspěšná!', 'Váš účet byl vytvořen a jste přihlášeni.', [{ text: 'OK' }]);
        } else {
          Alert.alert(
            'Registrace úspěšná!',
            'Zkontrolujte svůj email a potvrďte registraci.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      }
    } catch (error: any) {
      Alert.alert('Chyba registrace', `${error.message || error}\n\nZkuste to znovu.`);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    label, value, onChange, placeholder, secureTextEntry, keyboardType, autoCapitalize, autoComplete,
    rightElement,
  }: any) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 12, color: '#9ca3af', fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 }}>
        {label}
      </Text>
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
      }}>
        <TextInput
          style={{ flex: 1, color: '#ffffff', paddingVertical: 15, fontSize: 15 }}
          placeholder={placeholder}
          placeholderTextColor="#4b5563"
          value={value}
          onChangeText={onChange}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize || 'none'}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          editable={!loading}
        />
        {rightElement}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
      <LinearGradient
        colors={['#1a1040', '#0A0A0F']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: SCREEN_HEIGHT * 0.4 }}
      />
      <View style={{
        position: 'absolute', top: -60, right: -60,
        width: 240, height: 240, borderRadius: 120,
        backgroundColor: 'rgba(99,102,241,0.1)',
      }} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back button */}
            <Pressable
              onPress={() => navigation.goBack()}
              style={{
                flexDirection: 'row', alignItems: 'center',
                paddingTop: 16, paddingBottom: 8, alignSelf: 'flex-start',
              }}
            >
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 10, padding: 8, marginRight: 10,
              }}>
                <Ionicons name="arrow-back" size={18} color="#9ca3af" />
              </View>
              <Text style={{ color: '#9ca3af', fontSize: 15, fontWeight: '500' }}>Zpět</Text>
            </Pressable>

            {/* Header */}
            <Animated.View style={[{ marginTop: 16, marginBottom: 36 }, headerStyle]}>
              <Text style={{ fontSize: 32, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5, marginBottom: 8 }}>
                Vytvořit účet
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: 15, lineHeight: 22 }}>
                Zaregistrujte se a začněte hledat svůj nový domov
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View style={formStyle}>
              <InputField
                label="CELÉ JMÉNO"
                value={fullName}
                onChange={setFullName}
                placeholder="Jan Novák"
                autoCapitalize="words"
              />
              <InputField
                label="EMAIL"
                value={email}
                onChange={setEmail}
                placeholder="vas@email.cz"
                keyboardType="email-address"
                autoComplete="email"
              />
              <InputField
                label="HESLO"
                value={password}
                onChange={setPassword}
                placeholder="Alespoň 6 znaků"
                secureTextEntry={!showPassword}
                rightElement={
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#6b7280" />
                  </Pressable>
                }
              />
              <InputField
                label="POTVRDIT HESLO"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Zadejte heslo znovu"
                secureTextEntry={!showPassword}
              />

              {/* Register Button */}
              <Pressable
                onPress={handleRegister}
                disabled={loading}
                style={{ borderRadius: 16, overflow: 'hidden', marginTop: 8, marginBottom: 20, opacity: loading ? 0.6 : 1 }}
              >
                <LinearGradient
                  colors={['#6366f1', '#3b82f6']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ paddingVertical: 18, alignItems: 'center' }}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 17 }}>Zaregistrovat se</Text>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Terms */}
              <Text style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', lineHeight: 20, paddingBottom: 40 }}>
                Registrací souhlasíte s našimi{' '}
                <Text style={{ color: '#818cf8' }}>podmínkami použití</Text> a{' '}
                <Text style={{ color: '#818cf8' }}>zásadami ochrany osobních údajů</Text>
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
