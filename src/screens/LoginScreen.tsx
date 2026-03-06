import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { supabase } from '../api/supabase';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { usePropertyStore } from '../state/propertyStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DEBUG_MODE = true;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const completeSetup = usePropertyStore((state) => state.completeSetup);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAppleSignInAvailable, setIsAppleSignInAvailable] = useState(false);

  // Animations
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(-30);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(40);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    checkAppleSignInAvailability();
    logoOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) });
    logoTranslateY.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.back(1.2)) });
    formOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    formTranslateY.value = withDelay(300, withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) }));
  }, []);

  const logoAnimStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }],
  }));

  const formAnimStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const checkAppleSignInAvailability = async () => {
    try {
      const available = await AppleAuthentication.isAvailableAsync();
      setIsAppleSignInAvailable(available);
    } catch {
      setIsAppleSignInAvailable(false);
    }
  };

  const handleDebugSkip = () => {
    Alert.alert(
      'DEBUG MODE',
      'Přeskočit přihlášení a jít rovnou do aplikace?',
      [
        { text: 'Zrušit', style: 'cancel' },
        {
          text: 'Přeskočit na Onboarding',
          onPress: () => navigation.replace('Onboarding'),
        },
        {
          text: 'Přeskočit do aplikace',
          onPress: () => {
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
    buttonScale.value = withSpring(0.97, { damping: 10 }, () => {
      buttonScale.value = withSpring(1);
    });
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;
    } catch (error: any) {
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

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });
        if (error) throw error;
      } else {
        throw new Error('Nepodařilo se získat Apple ID token');
      }
    } catch (error: any) {
      if (error.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Chyba Apple Sign-In', `${error.message || error}\n\nZkuste to znovu.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#1a1040', '#0A0A0F', '#0A0A0F']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: SCREEN_HEIGHT * 0.5 }}
      />

      {/* Decorative circles */}
      <View style={{
        position: 'absolute', top: -80, right: -80,
        width: 280, height: 280, borderRadius: 140,
        backgroundColor: 'rgba(99,102,241,0.12)',
      }} />
      <View style={{
        position: 'absolute', top: 100, left: -60,
        width: 180, height: 180, borderRadius: 90,
        backgroundColor: 'rgba(59,130,246,0.08)',
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
            <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 40 }}>

              {/* Logo / Header */}
              <Animated.View style={[{ alignItems: 'center', marginBottom: 48 }, logoAnimStyle]}>
                <LinearGradient
                  colors={['#6366f1', '#3b82f6']}
                  style={{
                    width: 88, height: 88, borderRadius: 28,
                    alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20,
                    shadowColor: '#6366f1',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.5,
                    shadowRadius: 20,
                    elevation: 10,
                  }}
                >
                  <Ionicons name="home" size={42} color="white" />
                </LinearGradient>
                <Text style={{ fontSize: 32, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5 }}>
                  Reality v Kapse
                </Text>
                <Text style={{ color: '#9ca3af', marginTop: 8, fontSize: 16 }}>
                  Najděte svůj nový domov
                </Text>
              </Animated.View>

              {/* Form */}
              <Animated.View style={formAnimStyle}>
                {/* Email */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#9ca3af', marginBottom: 8, letterSpacing: 0.5 }}>
                    EMAIL
                  </Text>
                  <View style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                  }}>
                    <Ionicons name="mail-outline" size={18} color="#6b7280" style={{ marginRight: 10 }} />
                    <TextInput
                      style={{ flex: 1, color: '#ffffff', paddingVertical: 16, fontSize: 16 }}
                      placeholder="vas@email.cz"
                      placeholderTextColor="#4b5563"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#9ca3af', marginBottom: 8, letterSpacing: 0.5 }}>
                    HESLO
                  </Text>
                  <View style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                  }}>
                    <Ionicons name="lock-closed-outline" size={18} color="#6b7280" style={{ marginRight: 10 }} />
                    <TextInput
                      style={{ flex: 1, color: '#ffffff', paddingVertical: 16, fontSize: 16 }}
                      placeholder="••••••••"
                      placeholderTextColor="#4b5563"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                      editable={!loading}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#6b7280"
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Login Button */}
                <Animated.View style={btnAnimStyle}>
                  <Pressable
                    onPress={handleLogin}
                    disabled={loading}
                    style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}
                  >
                    <LinearGradient
                      colors={loading ? ['#374151', '#374151'] : ['#6366f1', '#3b82f6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ paddingVertical: 18, alignItems: 'center' }}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text style={{ color: 'white', fontWeight: '700', fontSize: 17 }}>
                          Přihlásit se
                        </Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                </Animated.View>

                {/* Forgot password */}
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                  <Pressable onPress={() => navigation.navigate('ForgotPassword')} disabled={loading}>
                    <Text style={{ color: '#6366f1', fontWeight: '600' }}>Zapomněli jste heslo?</Text>
                  </Pressable>
                </View>

                {/* Divider */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
                  <Text style={{ color: '#6b7280', marginHorizontal: 16, fontSize: 13 }}>nebo</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
                </View>

                {/* Register */}
                <Pressable
                  onPress={() => navigation.navigate('Register')}
                  disabled={loading}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderRadius: 14,
                    paddingVertical: 17,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ color: '#e5e7eb', fontWeight: '600', fontSize: 16 }}>
                    Vytvořit účet
                  </Text>
                </Pressable>

                {/* Apple Sign-In */}
                {isAppleSignInAvailable && (
                  <View style={{ marginBottom: 16 }}>
                    <AppleAuthentication.AppleAuthenticationButton
                      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                      cornerRadius={14}
                      style={{ width: '100%', height: 54 }}
                      onPress={handleAppleSignIn}
                    />
                  </View>
                )}

                {/* Debug */}
                {DEBUG_MODE && (
                  <Pressable
                    onPress={handleDebugSkip}
                    style={{
                      backgroundColor: 'rgba(251,146,60,0.15)',
                      borderRadius: 12,
                      paddingVertical: 14,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(251,146,60,0.3)',
                      marginTop: 8,
                    }}
                  >
                    <Text style={{ color: '#fb923c', fontWeight: '600' }}>
                      DEBUG: Přeskočit přihlášení
                    </Text>
                  </Pressable>
                )}
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
