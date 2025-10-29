import type { Property, PropertyRating } from "../types/property";

/**
 * Parses location string into city, district, and microLocation
 * Examples:
 * - "Praha 3, Žižkov" -> { city: "Praha", district: "Praha 3", microLocation: "Žižkov" }
 * - "Brno, Střed" -> { city: "Brno", district: "Brno", microLocation: "Střed" }
 * - "Praha" -> { city: "Praha", district: undefined, microLocation: undefined }
 */
export function parseLocation(location: string): {
  city?: string;
  district?: string;
  microLocation?: string;
} {
  const parts = location.split(',').map(p => p.trim());

  if (parts.length === 1) {
    return { city: parts[0] };
  }

  if (parts.length === 2) {
    // Check if first part contains a number (e.g., "Praha 3")
    const hasDistrict = /\d/.test(parts[0]);

    if (hasDistrict) {
      const cityMatch = parts[0].match(/^([^\d]+)/);
      const city = cityMatch ? cityMatch[1].trim() : parts[0];
      return {
        city,
        district: parts[0],
        microLocation: parts[1],
      };
    } else {
      return {
        city: parts[0],
        microLocation: parts[1],
      };
    }
  }

  return { city: parts[0] };
}

/**
 * Compares properties within the same microLocation
 */
export function getPropertiesInSameMicroLocation(
  property: Property,
  allProperties: Property[]
): Property[] {
  const parsedLocation = parseLocation(property.location);

  return allProperties.filter(p => {
    if (p.id === property.id) return false;

    const pLocation = parseLocation(p.location);

    // Must match type and disposition
    if (p.type !== property.type || p.disposition !== property.disposition) {
      return false;
    }

    // Priority 1: Match microLocation if available
    if (parsedLocation.microLocation && pLocation.microLocation) {
      return (
        pLocation.microLocation.toLowerCase() === parsedLocation.microLocation.toLowerCase() &&
        pLocation.city?.toLowerCase() === parsedLocation.city?.toLowerCase()
      );
    }

    // Priority 2: Match district if available
    if (parsedLocation.district && pLocation.district) {
      return pLocation.district.toLowerCase() === parsedLocation.district.toLowerCase();
    }

    // Priority 3: Match city
    if (parsedLocation.city && pLocation.city) {
      return pLocation.city.toLowerCase() === parsedLocation.city.toLowerCase();
    }

    return false;
  });
}

/**
 * Get comparison statistics for a property within its microLocation
 */
export function getMicroLocationComparison(
  property: Property,
  allProperties: Property[]
): {
  similarProperties: Property[];
  averagePricePerM2: number;
  averagePrice: number;
  pricePercentile: number; // 0-100, where lower is better (cheaper)
  betterDealsCount: number;
  totalCount: number;
} {
  const similarProperties = getPropertiesInSameMicroLocation(property, allProperties);

  if (similarProperties.length === 0) {
    return {
      similarProperties: [],
      averagePricePerM2: property.pricePerM2,
      averagePrice: property.price,
      pricePercentile: 50,
      betterDealsCount: 0,
      totalCount: 0,
    };
  }

  const avgPricePerM2 = similarProperties.reduce((sum, p) => sum + p.pricePerM2, 0) / similarProperties.length;
  const avgPrice = similarProperties.reduce((sum, p) => sum + p.price, 0) / similarProperties.length;

  // Count how many properties are cheaper
  const cheaperCount = similarProperties.filter(p => p.pricePerM2 < property.pricePerM2).length;
  const pricePercentile = (cheaperCount / similarProperties.length) * 100;

  // Count properties with better deals (higher discount %)
  const betterDealsCount = similarProperties.filter(p => p.discountPercentage > property.discountPercentage).length;

  return {
    similarProperties: similarProperties.sort((a, b) => a.pricePerM2 - b.pricePerM2),
    averagePricePerM2: avgPricePerM2,
    averagePrice: avgPrice,
    pricePercentile,
    betterDealsCount,
    totalCount: similarProperties.length,
  };
}

/**
 * Calculates the rating (C, B, A, A+) for a property based on discount percentage
 */
export function calculatePropertyRating(discountPercentage: number): PropertyRating {
  if (discountPercentage >= 15) return "A+";
  if (discountPercentage >= 10) return "A";
  if (discountPercentage >= 5) return "B";
  return "C";
}

/**
 * Gets the color for each rating
 */
export function getRatingColor(rating: PropertyRating): string {
  switch (rating) {
    case "A+":
      return "#10b981"; // green-500
    case "A":
      return "#3b82f6"; // blue-500
    case "B":
      return "#f59e0b"; // amber-500
    case "C":
      return "#ef4444"; // red-500
  }
}

/**
 * Gets background color for rating badge
 */
export function getRatingBackgroundColor(rating: PropertyRating): string {
  switch (rating) {
    case "A+":
      return "#d1fae5"; // green-100
    case "A":
      return "#dbeafe"; // blue-100
    case "B":
      return "#fef3c7"; // amber-100
    case "C":
      return "#fee2e2"; // red-100
  }
}

/**
 * Calculates average price per m² for properties in a location
 */
export function calculateAveragePricePerM2(
  properties: Property[],
  location: string,
  type: string
): number {
  const filtered = properties.filter(
    (p) => p.location.includes(location) && p.type === type
  );
  
  if (filtered.length === 0) return 0;
  
  const total = filtered.reduce((sum, p) => sum + p.pricePerM2, 0);
  return total / filtered.length;
}

/**
 * Formats price in CZK
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Formats number with spaces as thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("cs-CZ").format(num);
}

/**
 * Calculates mortgage details
 */
export function calculateMortgage(
  propertyPrice: number,
  downPaymentPercent: number = 20,
  interestRate: number = 5.5,
  loanTermYears: number = 30
) {
  const downPayment = propertyPrice * (downPaymentPercent / 100);
  const loanAmount = propertyPrice - downPayment;
  
  // Monthly interest rate
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;
  
  // Monthly payment calculation using amortization formula
  const monthlyPayment =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  const totalPaid = monthlyPayment * numberOfPayments;
  const totalInterest = totalPaid - loanAmount;
  
  return {
    propertyPrice,
    downPayment,
    loanAmount,
    interestRate,
    loanTermYears,
    monthlyPayment,
    totalPaid,
    totalInterest,
  };
}
