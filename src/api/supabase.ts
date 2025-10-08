import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TYTO HODNOTY BUDOU NASTAVENY PO VYTVOŘENÍ SUPABASE PROJEKTU
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  subscription_type: 'free' | 'basic' | 'premium' | 'pro';
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  locations: string[];
  property_types: string[];
  dispositions: string[];
  price_min: number;
  price_max: number;
  area_min: number;
  area_max: number;
  min_discount_percentage: number;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}
