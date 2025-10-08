// Migration Script: Google Sheets → Supabase
// Přesune všechna data z Google Sheets do Supabase properties tabulky
// Spusťte: node migrate-to-supabase.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase client s SERVICE KEY (pro zápis do DB)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const googleSheetsId = process.env.EXPO_PUBLIC_GOOGLE_SHEETS_ID;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

if (!googleSheetsId) {
  console.error('❌ Missing EXPO_PUBLIC_GOOGLE_SHEETS_ID in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Parse CSV line with quotes support
 */
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Calculate property rating based on discount
 */
function calculatePropertyRating(discountPercentage) {
  if (discountPercentage >= 20) return "A+";
  if (discountPercentage >= 15) return "A";
  if (discountPercentage >= 10) return "B";
  return "C";
}

/**
 * Convert CSV row to property object (scraper format)
 */
function rowToProperty(row, index) {
  try {
    const [
      hash_id,
      url,
      titulek,
      lokalita,
      dispozice,
      plocha_m2,
      cena,
      cena_za_m2,
      patro,
      stav_objektu,
      image_url,
      telefon,
      vlozeno_at,
      upraveno_at,
      first_seen_at,
      last_seen_at,
      last_price,
      price_changed_at,
      status,
      hypo_mesic,
    ] = row;

    // Validace povinných polí
    if (!hash_id || !titulek || !cena || !plocha_m2 || !lokalita) {
      return null;
    }

    const price = parseFloat(cena.replace(/[^\d.-]/g, ""));
    const area = parseFloat(plocha_m2.replace(/[^\d.-]/g, ""));
    const pricePerM2 = parseFloat(cena_za_m2?.replace(/[^\d.-]/g, "") || "0") || Math.round(price / area);
    
    // Vypočítat slevu z price history
    let discountPercentage = 0;
    if (last_price && price_changed_at) {
      const lastPriceNum = parseFloat(last_price.replace(/[^\d.-]/g, ""));
      if (lastPriceNum > price) {
        discountPercentage = Math.round(((lastPriceNum - price) / lastPriceNum) * 100);
      }
    }

    // Detekovat typ z URL nebo lokality
    let propertyType = "byt";
    if (url?.includes("/dum/") || titulek?.toLowerCase().includes("dům")) {
      propertyType = "dům";
    } else if (url?.includes("/pozemek/")) {
      propertyType = "pozemek";
    } else if (url?.includes("/komercni/")) {
      propertyType = "komerční";
    }

    // Validace dispozice
    const validDispositions = [
      "1+kk", "1+1", "2+kk", "2+1", "3+kk", "3+1",
      "4+kk", "4+1", "5+kk", "5+1", "6+kk", "6+1", "atypický"
    ];
    const propertyDisposition = validDispositions.includes(dispozice)
      ? dispozice
      : "2+kk";

    // Extrahovat hash_id bez indexu
    const cleanHashId = hash_id.includes('-') ? hash_id.split('-')[0] : hash_id;
    
    return {
      id: `${hash_id.trim()}-${index}`,
      hash_id: cleanHashId.trim(),
      title: titulek.trim(),
      description: `${stav_objektu || "Popis není k dispozici"}${patro ? `, ${patro}` : ""}`,
      price: Math.round(price),
      area: area,
      price_per_m2: pricePerM2,
      location: lokalita.trim(),
      type: propertyType,
      disposition: propertyDisposition,
      rating: calculatePropertyRating(discountPercentage),
      discount_percentage: discountPercentage,
      image_url: image_url?.trim() || "https://via.placeholder.com/800x600?text=Bez+obrázku",
      source: "sreality",
      source_url: url?.trim() || "",
      status: status === "new" ? "new" : "active",
      last_price: last_price ? parseFloat(last_price.replace(/[^\d.-]/g, "")) : null,
      price_changed_at: price_changed_at || null,
      agent_name: telefon ? "Makléř" : null,
      agent_phone: telefon?.trim() || null,
      agent_email: null,
      floor: patro || null,
      building_state: stav_objektu || null,
      created_at: vlozeno_at || new Date().toISOString(),
      first_seen_at: first_seen_at || vlozeno_at || new Date().toISOString(),
      last_seen_at: last_seen_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Chyba při parsování řádku ${index + 2}:`, error);
    return null;
  }
}

/**
 * Fetch properties from Google Sheets
 */
async function fetchPropertiesFromGoogleSheets() {
  const url = `https://docs.google.com/spreadsheets/d/${googleSheetsId}/export?format=csv`;
  
  console.log("📊 Načítám data z Google Sheets...");
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'text/csv, application/csv, text/plain',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const csvText = await response.text();
  
  // Zkontrolovat, zda se nejedná o HTML (error page)
  if (csvText.trim().startsWith('<!DOCTYPE') || csvText.trim().startsWith('<html')) {
    throw new Error("Google Sheets vrátil HTML místo CSV - tabulka není veřejně přístupná!");
  }
  
  const lines = csvText.split("\n").filter((line) => line.trim());

  if (lines.length === 0) {
    return [];
  }

  // Přeskočit první řádek (header)
  const dataLines = lines.slice(1);

  if (dataLines.length === 0) {
    return [];
  }

  console.log(`📊 Celkem řádků dat: ${dataLines.length}`);

  const properties = [];

  for (let i = 0; i < dataLines.length; i++) {
    const row = parseCSVLine(dataLines[i]);
    const property = rowToProperty(row, i);

    if (property) {
      properties.push(property);
    }
  }

  console.log(`✅ Úspěšně zparsováno ${properties.length} z ${dataLines.length} nemovitostí`);
  
  return properties;
}

async function migrateToSupabase() {
  console.log('\n🚀 Začínám migraci dat z Google Sheets do Supabase...\n');

  try {
    // KROK 1: Načíst data z Google Sheets
    console.log('📊 Krok 1/4: Načítám data z Google Sheets...');
    const properties = await fetchPropertiesFromGoogleSheets();
    console.log(`✅ Načteno ${properties.length} nemovitostí\n`);

    if (properties.length === 0) {
      console.log('⚠️  Žádná data k migraci!');
      return;
    }

    // KROK 2: Insert do Supabase (po dávkách)
    console.log('💾 Krok 2/4: Ukládám do Supabase...');
    const batchSize = 50; // Supabase doporučuje max 50-100 per batch
    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < properties.length; i += batchSize) {
      const batch = properties.slice(i, i + batchSize);
      
      try {
        const { data, error } = await supabase
          .from('properties')
          .upsert(batch, {
            onConflict: 'id',
            ignoreDuplicates: false
          });

        if (error) {
          console.error(`❌ Chyba při ukládání batch ${i}-${i + batch.length}:`, error.message);
          errors += batch.length;
        } else {
          const batchProcessed = batch.length;
          inserted += batchProcessed;
          console.log(`   ✅ Uloženo ${i + batchProcessed}/${properties.length}`);
        }
      } catch (err) {
        console.error(`❌ Neočekávaná chyba:`, err.message);
        errors += batch.length;
      }
    }

    console.log(`\n✅ Migrace dokončena!`);
    console.log(`   📊 Celkem: ${properties.length}`);
    console.log(`   ✅ Úspěšně: ${inserted}`);
    console.log(`   ❌ Chyby: ${errors}\n`);

    // KROK 3: Verifikace
    console.log('🔍 Krok 3/4: Verifikuji data v Supabase...');
    const { count, error: countError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Chyba při verifikaci:', countError);
    } else {
      console.log(`✅ Celkem nemovitostí v Supabase: ${count}\n`);
      
      if (count >= properties.length) {
        console.log('🎉 ÚSPĚCH! Všechna data byla úspěšně migrována!');
      } else {
        console.log(`⚠️  V Supabase je méně nemovitostí (${count}) než v Sheets (${properties.length})`);
      }
    }

    // KROK 4: Zobrazit statistiky
    console.log('\n📈 Krok 4/4: Statistiky:');
    const { data: stats } = await supabase
      .from('properties_stats')
      .select('*')
      .single();
    
    if (stats) {
      console.log(`   • Celkem: ${stats.total_properties}`);
      console.log(`   • Aktivních: ${stats.active_count}`);
      console.log(`   • Nových: ${stats.new_count}`);
      console.log(`   • Průměrná cena: ${Math.round(stats.avg_price).toLocaleString()} Kč`);
      console.log(`   • Průměrná cena/m²: ${Math.round(stats.avg_price_per_m2).toLocaleString()} Kč/m²`);
      console.log(`   • Lokalit: ${stats.unique_locations}`);
    }

    console.log('\n✅ Migrace HOTOVA!');
    console.log('💡 Nyní můžete aktualizovat aplikaci aby četla z Supabase\n');

  } catch (error) {
    console.error('\n❌ CHYBA při migraci:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Spustit migraci
migrateToSupabase();
