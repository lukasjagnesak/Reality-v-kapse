export type PropertyType = "byt" | "dům" | "pozemek" | "komerční";

export type PropertyDisposition = 
  | "1+kk" 
  | "1+1" 
  | "2+kk" 
  | "2+1" 
  | "3+kk" 
  | "3+1" 
  | "4+kk" 
  | "4+1" 
  | "5+kk" 
  | "5+1" 
  | "6+kk"
  | "6+1"
  | "atypický";

export type PropertyRating = "C" | "B" | "A" | "A+";

export type PropertySource = "sreality" | "annonce" | "bezrealitky" | "google_sheets";

export interface AgentContact {
  name: string;
  phone?: string;
  email?: string;
  company?: string;
}

export interface PriceHistory {
  oldPrice: number;
  newPrice: number;
  changedAt: Date;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number; // Celková cena v Kč
  area: number; // Rozloha v m²
  pricePerM2: number; // Cena za m²
  location: string; // Např. "Praha 3, Žižkov"
  microLocation?: string; // Např. "Žižkov", "Vinohrady" - přesná microlocalita
  city?: string; // Např. "Praha"
  district?: string; // Např. "Praha 3"
  type: PropertyType;
  disposition: PropertyDisposition;
  rating: PropertyRating; // C, B, A, A+
  discountPercentage: number; // O kolik % levnější než průměr
  imageUrl: string;
  source: PropertySource;
  sourceUrl: string;
  createdAt: Date;
  latitude?: number;
  longitude?: number;
  agent?: AgentContact; // Kontakt na makléře
  priceHistory?: PriceHistory; // Změna ceny
  isNew?: boolean; // Nový inzerát (méně než 24h)
}

export interface UserPreferences {
  locations: string[]; // Např. ["Praha", "Brno", "Ostrava"]
  propertyTypes: PropertyType[];
  dispositions: PropertyDisposition[];
  priceRange: {
    min: number;
    max: number;
  };
  areaRange: {
    min: number;
    max: number;
  };
  minDiscountPercentage: number; // Minimální požadované snížení ceny v %
  notificationsEnabled: boolean;
}

export interface MortgageCalculation {
  propertyPrice: number;
  downPayment: number; // Akontace
  loanAmount: number; // Výše úvěru
  interestRate: number; // Úroková sazba v %
  loanTermYears: number; // Doba splácení v letech
  monthlyPayment: number; // Měsíční splátka
  totalPaid: number; // Celkem zaplaceno
  totalInterest: number; // Celkem zaplaceno na úrocích
}
