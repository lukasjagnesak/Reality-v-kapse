export type SubscriptionType = "free" | "basic" | "premium" | "pro";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  subscription: SubscriptionType;
  createdAt?: Date;
}

export interface SubscriptionPlan {
  type: SubscriptionType;
  name: string;
  price: number; // Měsíční cena v Kč
  features: string[];
  maxLocations: number;
  maxFavorites: number;
  pushNotifications: boolean;
  priceAlerts: boolean;
  marketAnalysis: boolean;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionType, SubscriptionPlan> = {
  free: {
    type: "free",
    name: "Zdarma",
    price: 0,
    features: [
      "Sledování 1 lokality",
      "Až 10 oblíbených nemovitostí",
      "Základní filtrování",
    ],
    maxLocations: 1,
    maxFavorites: 10,
    pushNotifications: false,
    priceAlerts: false,
    marketAnalysis: false,
  },
  basic: {
    type: "basic",
    name: "Basic",
    price: 99,
    features: [
      "Sledování 3 lokalit",
      "Až 50 oblíbených nemovitostí",
      "Push notifikace",
      "Pokročilé filtrování",
    ],
    maxLocations: 3,
    maxFavorites: 50,
    pushNotifications: true,
    priceAlerts: true,
    marketAnalysis: false,
  },
  premium: {
    type: "premium",
    name: "Premium",
    price: 199,
    features: [
      "Sledování 10 lokalit",
      "Neomezené oblíbené",
      "Push notifikace",
      "Cenové upozornění",
      "Analýza trhu",
    ],
    maxLocations: 10,
    maxFavorites: -1, // Unlimited
    pushNotifications: true,
    priceAlerts: true,
    marketAnalysis: true,
  },
  pro: {
    type: "pro",
    name: "Pro",
    price: 399,
    features: [
      "Neomezené lokality",
      "Neomezené oblíbené",
      "Prioritní notifikace",
      "Pokročilá analýza trhu",
      "Export dat",
      "API přístup",
    ],
    maxLocations: -1, // Unlimited
    maxFavorites: -1, // Unlimited
    pushNotifications: true,
    priceAlerts: true,
    marketAnalysis: true,
  },
};
