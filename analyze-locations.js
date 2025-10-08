require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeLocations() {
  console.log('🔍 Analyzuji lokality v databázi...\n');
  
  // Získat všechny unikátní lokality
  const { data, error } = await supabase
    .from('properties')
    .select('location, disposition, price, area, price_per_m2')
    .order('location');
  
  if (error) {
    console.error('❌ Chyba:', error);
    return;
  }
  
  console.log(`📊 Celkem nemovitostí: ${data.length}\n`);
  
  // Groupovat podle lokality
  const locationGroups = {};
  
  data.forEach(prop => {
    const loc = prop.location;
    if (!locationGroups[loc]) {
      locationGroups[loc] = {
        count: 0,
        dispositions: {},
        avgPriceM2: 0,
        totalPriceM2: 0
      };
    }
    
    locationGroups[loc].count++;
    locationGroups[loc].totalPriceM2 += prop.price_per_m2 || 0;
    
    const disp = prop.disposition;
    if (!locationGroups[loc].dispositions[disp]) {
      locationGroups[loc].dispositions[disp] = {
        count: 0,
        avgPriceM2: 0,
        totalPriceM2: 0
      };
    }
    locationGroups[loc].dispositions[disp].count++;
    locationGroups[loc].dispositions[disp].totalPriceM2 += prop.price_per_m2 || 0;
  });
  
  // Vypočítat průměry
  Object.keys(locationGroups).forEach(loc => {
    const group = locationGroups[loc];
    group.avgPriceM2 = Math.round(group.totalPriceM2 / group.count);
    
    Object.keys(group.dispositions).forEach(disp => {
      const dispGroup = group.dispositions[disp];
      dispGroup.avgPriceM2 = Math.round(dispGroup.totalPriceM2 / dispGroup.count);
    });
  });
  
  // Top 10 lokalit
  const sorted = Object.entries(locationGroups)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);
  
  console.log('📍 Top 10 lokalit s nejvíce nemovitostmi:\n');
  sorted.forEach(([loc, data], i) => {
    console.log(`${i+1}. ${loc}`);
    console.log(`   • Počet: ${data.count}`);
    console.log(`   • Průměrná cena/m²: ${data.avgPriceM2.toLocaleString()} Kč`);
    console.log(`   • Dispozice: ${Object.keys(data.dispositions).join(', ')}`);
    console.log('');
  });
  
  // Analyzovat formát lokalit
  console.log('\n🗺️  Analýza formátu lokalit:\n');
  const sampleLocations = Object.keys(locationGroups).slice(0, 20);
  sampleLocations.forEach(loc => {
    console.log(`   "${loc}"`);
  });
  
  // Zkontrolovat hierarchii
  console.log('\n🔬 Detekce hierarchie:\n');
  const withComma = sampleLocations.filter(l => l.includes(','));
  const withDash = sampleLocations.filter(l => l.includes(' - '));
  
  console.log(`   • S čárkou (,): ${withComma.length} z ${sampleLocations.length}`);
  console.log(`   • S pomlčkou ( - ): ${withDash.length} z ${sampleLocations.length}`);
  
  if (withComma.length > 0) {
    console.log('\n   Příklad s čárkou:');
    withComma.slice(0, 3).forEach(l => console.log(`     "${l}"`));
  }
  
  if (withDash.length > 0) {
    console.log('\n   Příklad s pomlčkou:');
    withDash.slice(0, 3).forEach(l => console.log(`     "${l}"`));
  }
}

analyzeLocations();
