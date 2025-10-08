const cena = "5 150 000 Kč";
const cena_za_m2 = "72 535 Kč";
const plocha = "71";

const price = parseFloat(cena.replace(/[^\d.-]/g, ""));
const pricePerM2 = parseFloat(cena_za_m2.replace(/[^\d.-]/g, ""));
const area = parseFloat(plocha.replace(/[^\d.-]/g, ""));

console.log("Cena string:", cena);
console.log("Parsed price:", price);
console.log("Plocha:", area);
console.log("Cena za m2:", pricePerM2);
console.log("Je validní?", !isNaN(price) && !isNaN(area) && area > 0);
