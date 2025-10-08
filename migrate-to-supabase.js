// Migration Script: Google Sheets → Supabase
// Přesune všechna data z Google Sheets do Supabase properties tabulky
// Spusťte: node migrate-to-supabase.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Import existující funkce pro načtení dat
const { fetchPropertiesFromGoogleSheets } = require('./src/api/googleSheetsService');

// Supabase client s SERVICE KEY (pro zápis do DB)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // KROK 2: Transformovat data pro Supabase
    console.log('🔄 Krok 2/4: Transformuji data...');
    const transformedProperties = properties.map(p => {
      // Extrahovat hash_id z id (remove index suffix)
      const hashId = p.id.includes('-') ? p.id.split('-')[0] : p.id;
      
      return {
        id: p.id,
        hash_id: hashId,
        title: p.title,
        description: p.description || 'Popis není k dispozici',
        price: Math.round(p.price),
        area: p.area,
        price_per_m2: p.pricePerM2 || Math.round(p.price / p.area),
        location: p.location,
        type: p.type,
        disposition: p.disposition,
        rating: p.rating,
        discount_percentage: p.discountPercentage || 0,
        image_url: p.imageUrl,
        source: p.source || 'sreality',
        source_url: p.sourceUrl,
        status: p.isNew ? 'new' : 'active',
        last_price: p.priceHistory?.oldPrice || null,
        price_changed_at: p.priceHistory?.changedAt || null,
        agent_name: p.agent?.name || null,
        agent_phone: p.agent?.phone || null,
        agent_email: p.agent?.email || null,
        floor: null,
        building_state: null,
        created_at: p.createdAt || new Date(),
        first_seen_at: p.createdAt || new Date(),
        last_seen_at: new Date(),
      };
    });
    console.log(`✅ Data transformována\n`);

    // KROK 3: Insert do Supabase (po dávkách)
    console.log('💾 Krok 3/4: Ukládám do Supabase...');
    const batchSize = 50; // Supabase doporučuje max 50-100 per batch
    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (let i = 0; i < transformedProperties.length; i += batchSize) {
      const batch = transformedProperties.slice(i, i + batchSize);
      
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
          console.log(`   ✅ Uloženo ${i + batchProcessed}/${transformedProperties.length}`);
        }
      } catch (err) {
        console.error(`❌ Neočekávaná chyba:`, err.message);
        errors += batch.length;
      }
    }

    console.log(`\n✅ Migrace dokončena!`);
    console.log(`   📊 Celkem: ${transformedProperties.length}`);
    console.log(`   ✅ Úspěšně: ${inserted}`);
    console.log(`   ❌ Chyby: ${errors}\n`);

    // KROK 4: Verifikace
    console.log('🔍 Krok 4/4: Verifikuji data v Supabase...');
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

    // Zobrazit statistiky
    console.log('\n📈 Statistiky:');
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
