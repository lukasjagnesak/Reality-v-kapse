import type { Property, PropertyRating } from "../types/property";

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
