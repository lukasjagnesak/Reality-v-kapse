import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Property, UserPreferences } from "../types/property";

interface PropertyState {
  // User preferences
  preferences: UserPreferences;
  setPreferences: (preferences: UserPreferences) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  
  // Properties
  properties: Property[];
  setProperties: (properties: Property[]) => void;
  addProperty: (property: Property) => void;
  
  // Filtering
  filteredProperties: Property[];
  applyFilters: () => void;
  
  // Favorites
  favoriteIds: string[];
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
  
  // Current interest rate for mortgage calculations
  currentInterestRate: number;
  setCurrentInterestRate: (rate: number) => void;
  
  // First time setup
  hasCompletedSetup: boolean;
  completeSetup: () => void;
}

const defaultPreferences: UserPreferences = {
  locations: [],
  propertyTypes: ["byt", "dům"],
  dispositions: ["1+kk", "1+1", "2+kk", "2+1", "3+kk", "3+1", "4+kk", "4+1"],
  priceRange: {
    min: 0,
    max: 50000000,
  },
  areaRange: {
    min: 0,
    max: 500,
  },
  minDiscountPercentage: 0, // Zobrazit všechny nemovitosti
  notificationsEnabled: true,
};

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set, get) => ({
      // Initial state
      preferences: defaultPreferences,
      properties: [],
      filteredProperties: [],
      favoriteIds: [],
      currentInterestRate: 5.5, // Default current rate
      hasCompletedSetup: false,
      
      // Actions
      setPreferences: (preferences) => {
        set({ preferences });
        get().applyFilters();
      },
      
      updatePreferences: (updates) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        }));
        get().applyFilters();
      },
      
      setProperties: (properties) => {
        set({ properties });
        get().applyFilters();
      },
      
      addProperty: (property) => {
        set((state) => ({
          properties: [property, ...state.properties],
        }));
        get().applyFilters();
      },
      
      applyFilters: () => {
        const { properties, preferences } = get();
        
        console.log(`🔍 Aplikuji filtry na ${properties.length} nemovitostí`);
        console.log(`📋 Filtry:`, preferences);
        
        const filtered = properties.filter((property) => {
          // Filter by location
          if (preferences.locations.length > 0) {
            const matchesLocation = preferences.locations.some((loc) =>
              property.location.toLowerCase().includes(loc.toLowerCase())
            );
            if (!matchesLocation) {
              console.log(`❌ ${property.id} vyfiltrováno - lokalita ${property.location} neodpovídá ${preferences.locations}`);
              return false;
            }
          }
          
          // Filter by property type
          if (preferences.propertyTypes.length > 0) {
            if (!preferences.propertyTypes.includes(property.type)) {
              console.log(`❌ ${property.id} vyfiltrováno - typ ${property.type} není v ${preferences.propertyTypes}`);
              return false;
            }
          }
          
          // Filter by disposition
          if (preferences.dispositions.length > 0) {
            if (!preferences.dispositions.includes(property.disposition)) {
              console.log(`❌ ${property.id} vyfiltrováno - dispozice ${property.disposition} není v ${preferences.dispositions}`);
              return false;
            }
          }
          
          // Filter by price range
          if (property.price < preferences.priceRange.min || 
              property.price > preferences.priceRange.max) {
            console.log(`❌ ${property.id} vyfiltrováno - cena ${property.price} mimo rozsah ${preferences.priceRange.min}-${preferences.priceRange.max}`);
            return false;
          }
          
          // Filter by area range
          if (property.area < preferences.areaRange.min || 
              property.area > preferences.areaRange.max) {
            console.log(`❌ ${property.id} vyfiltrováno - plocha ${property.area} mimo rozsah ${preferences.areaRange.min}-${preferences.areaRange.max}`);
            return false;
          }
          
          // Filter by minimum discount
          if (property.discountPercentage < preferences.minDiscountPercentage) {
            console.log(`❌ ${property.id} vyfiltrováno - sleva ${property.discountPercentage}% < ${preferences.minDiscountPercentage}%`);
            return false;
          }
          
          console.log(`✅ ${property.id} prošel všemi filtry`);
          return true;
        });
        
        console.log(`✅ Po filtrování: ${filtered.length} nemovitostí`);
        
        // Sort by rating and discount
        filtered.sort((a, b) => {
          const ratingOrder = { "A+": 4, "A": 3, "B": 2, "C": 1 };
          const ratingDiff = ratingOrder[b.rating] - ratingOrder[a.rating];
          if (ratingDiff !== 0) return ratingDiff;
          return b.discountPercentage - a.discountPercentage;
        });
        
        set({ filteredProperties: filtered });
      },
      
      toggleFavorite: (propertyId) => {
        set((state) => {
          const isFav = state.favoriteIds.includes(propertyId);
          return {
            favoriteIds: isFav
              ? state.favoriteIds.filter((id) => id !== propertyId)
              : [...state.favoriteIds, propertyId],
          };
        });
      },
      
      isFavorite: (propertyId) => {
        return get().favoriteIds.includes(propertyId);
      },
      
      setCurrentInterestRate: (rate) => {
        set({ currentInterestRate: rate });
      },
      
      completeSetup: () => {
        set({ hasCompletedSetup: true });
      },
    }),
    {
      name: "reality-v-kapse-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        favoriteIds: state.favoriteIds,
        currentInterestRate: state.currentInterestRate,
        hasCompletedSetup: state.hasCompletedSetup,
      }),
    }
  )
);
