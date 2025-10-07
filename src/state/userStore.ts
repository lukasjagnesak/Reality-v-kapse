import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserProfile, SubscriptionType } from "../types/user";

interface UserState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSubscription: (subscription: SubscriptionType) => void;
  clearProfile: () => void;
  isLoggedIn: boolean;
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
    }),
    {
      name: "reality-v-kapse-user",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
