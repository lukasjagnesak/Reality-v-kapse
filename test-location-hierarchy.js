require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testLocationHierarchy() {
  console.log('\n🧪 Testování hierarchie lokalit a průměrných cen...\n');
  
  // Test 1: Zkontrolovat parsované lokality
  console.log('📍 Test 1: Parsované lokality\n');
  const { data: properties, error } = await supabase
    .from('properties')
    .select('location, location_city, location_district, location_street')
    .limit(5);
  
  if (error) {
    console.error('❌ Chyba:', error);
    return;
  }
  
  properties.forEach(p => {
    console.log(`   ${p.location}`);
    console.log(`   → Město: ${p.location_city}`);
    console.log(`   → Část: ${p.location_district}`);
    console.log(`   → Ulice: ${p.location_street}`);
    console.log('');
  });
  
  // Test 2: Unikátní města
  console.log('\n🏙️  Test 2: Unikátní města\n');
  const { data: cities } = await supabase
    .from('unique_cities')
    .select('*')
    .limit(5);
  
  cities?.forEach(c => {
    console.log(`   ${c.city} (${c.property_count} nemovitostí)`);
  });
  
  // Test 3: Části města Brno
  console.log('\n📍 Test 3: Části města Brno\n');
  const { data: districts } = await supabase
    .from('unique_districts')
    .select('*')
    .eq('city', 'Brno')
    .limit(5);
  
  districts?.forEach(d => {
    console.log(`   ${d.district} (${d.property_count} nemovitostí)`);
  });
  
  // Test 4: Průměrné ceny v Brně pro 2+kk
  console.log('\n💰 Test 4: Průměrné ceny v Brně pro 2+kk\n');
  const { data: avgPrices } = await supabase
    .from('avg_prices_city_disposition')
    .select('*')
    .eq('location_city', 'Brno')
    .eq('disposition', '2+kk')
    .single();
  
  if (avgPrices) {
    console.log(`   Počet nemovitostí: ${avgPrices.property_count}`);
    console.log(`   Průměrná cena/m²: ${avgPrices.avg_price_per_m2?.toLocaleString()} Kč`);
    console.log(`   Průměrná cena: ${avgPrices.avg_price?.toLocaleString()} Kč`);
  }
  
  // Test 5: Průměrné ceny v Brně - Židenice pro 2+kk
  console.log('\n💰 Test 5: Průměrné ceny v Brně - Židenice pro 2+kk\n');
  const { data: avgPricesDistrict } = await supabase
    .from('avg_prices_district_disposition')
    .select('*')
    .eq('location_city', 'Brno')
    .eq('location_district', 'Židenice')
    .eq('disposition', '2+kk')
    .single();
  
  if (avgPricesDistrict) {
    console.log(`   Počet nemovitostí: ${avgPricesDistrict.property_count}`);
    console.log(`   Průměrná cena/m²: ${avgPricesDistrict.avg_price_per_m2?.toLocaleString()} Kč`);
    console.log(`   Průměrná cena: ${avgPricesDistrict.avg_price?.toLocaleString()} Kč`);
  }
  
  // Test 6: Funkce get_avg_price_for_location
  console.log('\n🎯 Test 6: Inteligentní fallback pro průměrnou cenu\n');
  const { data: avgResult, error: avgError } = await supabase
    .rpc('get_avg_price_for_location', {
      p_city: 'Brno',
      p_district: 'Židenice',
      p_disposition: '2+kk'
    });
  
  if (avgError) {
    console.error('   ❌ Chyba:', avgError.message);
  } else if (avgResult && avgResult.length > 0) {
    const result = avgResult[0];
    console.log(`   Průměrná cena/m²: ${result.avg_price_per_m2?.toLocaleString()} Kč`);
    console.log(`   Počet nemovitostí: ${result.property_count}`);
    console.log(`   Level: ${result.level}`);
  }
  
  // Test 7: Nemovitosti s přepočítanou slevou
  console.log('\n🏷️  Test 7: Nemovitosti s přepočítanou slevou\n');
  const { data: propertiesWithDiscount } = await supabase
    .from('properties')
    .select('title, location_city, location_district, disposition, price_per_m2, discount_percentage')
    .gt('discount_percentage', 10)
    .order('discount_percentage', { ascending: false })
    .limit(5);
  
  propertiesWithDiscount?.forEach(p => {
    console.log(`   ${p.title.substring(0, 40)}...`);
    console.log(`   ${p.location_city} - ${p.location_district} | ${p.disposition}`);
    console.log(`   ${p.price_per_m2?.toLocaleString()} Kč/m² | Sleva: ${p.discount_percentage}%`);
    console.log('');
  });
  
  console.log('\n✅ Testy dokončeny!\n');
}

testLocationHierarchy();
