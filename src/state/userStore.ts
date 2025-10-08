import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserProfile, SubscriptionType } from "../types/user";
import { supabase } from "../api/supabase";

interface UserState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSubscription: (subscription: SubscriptionType) => void;
  clearProfile: () => void;
  isLoggedIn: boolean;
  // Supabase sync methods
  syncProfileFromDatabase: (userId: string) => Promise<void>;
  updateProfileInDatabase: (updates: Partial<UserProfile>) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoggedIn: false,

      setProfile: (profile) => {
        set({ profile, isLoggedIn: true });
      },

      updateProfile: (updates) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: { ...currentProfile, ...updates },
          });
        }
      },

      updateSubscription: (subscription) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: { ...currentProfile, subscription },
          });
        }
      },

      clearProfile: () => {
        set({ profile: null, isLoggedIn: false });
      },

      // Sync profile from Supabase database
      syncProfileFromDatabase: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (error) throw error;

          if (data) {
            const profile: UserProfile = {
              id: data.id,
              email: data.email,
              fullName: data.full_name || "",
              phone: data.phone || "",
              subscription: data.subscription_type,
            };
            set({ profile, isLoggedIn: true });
          }
        } catch (error) {
          console.error("❌ Error syncing profile from database:", error);
        }
      },

      // Update profile in Supabase database
      updateProfileInDatabase: async (updates: Partial<UserProfile>) => {
        const currentProfile = get().profile;
        if (!currentProfile) return;

        try {
          // Map our UserProfile fields to database column names
          const dbUpdates: any = {};
          if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
          if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
          if (updates.subscription !== undefined) dbUpdates.subscription_type = updates.subscription;

          const { error } = await supabase
            .from("user_profiles")
            .update(dbUpdates)
            .eq("id", currentProfile.id);

          if (error) throw error;

          // Update local state
          set({
            profile: { ...currentProfile, ...updates },
          });

          console.log("✅ Profile updated in database");
        } catch (error) {
          console.error("❌ Error updating profile in database:", error);
          throw error;
        }
      },
    }),
    {
      name: "reality-v-kapse-user",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
