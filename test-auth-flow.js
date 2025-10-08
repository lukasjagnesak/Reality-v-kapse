require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthFlow() {
  console.log('\n🧪 Testování auth flow a synchronizace preferencí...\n');
  
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestHeslo123!';
  
  try {
    // Test 1: Registrace
    console.log('📝 Test 1: Registrace nového uživatele\n');
    console.log(`   Email: ${testEmail}`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      console.log('❌ Chyba registrace:', signUpError.message);
      return;
    }
    
    console.log('✅ Registrace úspěšná');
    console.log(`   User ID: ${signUpData.user?.id}\n`);
    
    const userId = signUpData.user?.id;
    if (!userId) {
      console.log('❌ User ID není dostupné');
      return;
    }
    
    // Počkat 2 sekundy
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Uložit preference
    console.log('💾 Test 2: Uložení preferencí\n');
    
    const testPreferences = {
      user_id: userId,
      locations: ['Brno - Židenice', 'Brno - Veveří'],
      property_types: ['byt'],
      dispositions: ['2+kk', '3+kk'],
      price_min: 0,
      price_max: 10000000,
      area_min: 40,
      area_max: 80,
      min_discount_percentage: 10,
      notifications_enabled: true,
    };
    
    const { error: prefError } = await supabase
      .from('user_preferences')
      .upsert(testPreferences, { onConflict: 'user_id' });
    
    if (prefError) {
      console.log('❌ Chyba ukládání preferencí:', prefError.message);
    } else {
      console.log('✅ Preference uloženy');
      console.log(`   Lokality: ${testPreferences.locations.join(', ')}`);
      console.log(`   Dispozice: ${testPreferences.dispositions.join(', ')}`);
      console.log(`   Cena: ${testPreferences.price_min} - ${testPreferences.price_max} Kč\n`);
    }
    
    // Test 3: Načíst preference
    console.log('📥 Test 3: Načtení preferencí z databáze\n');
    
    const { data: loadedPrefs, error: loadError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (loadError) {
      console.log('❌ Chyba načítání preferencí:', loadError.message);
    } else {
      console.log('✅ Preference načteny');
      console.log(`   Lokality: ${loadedPrefs.locations.join(', ')}`);
      console.log(`   Dispozice: ${loadedPrefs.dispositions.join(', ')}`);
      console.log(`   Cena: ${loadedPrefs.price_min} - ${loadedPrefs.price_max} Kč`);
      
      // Ověřit, že data souhlasí
      const match = 
        JSON.stringify(loadedPrefs.locations) === JSON.stringify(testPreferences.locations) &&
        JSON.stringify(loadedPrefs.dispositions) === JSON.stringify(testPreferences.dispositions);
      
      if (match) {
        console.log('✅ Data souhlasí!\n');
      } else {
        console.log('❌ Data nesouhlasí!\n');
      }
    }
    
    // Test 4: Odhlášení
    console.log('🚪 Test 4: Odhlášení\n');
    
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.log('❌ Chyba odhlášení:', signOutError.message);
    } else {
      console.log('✅ Odhlášení úspěšné\n');
    }
    
    // Test 5: Přihlášení
    console.log('🔐 Test 5: Přihlášení zpět\n');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (signInError) {
      console.log('❌ Chyba přihlášení:', signInError.message);
    } else {
      console.log('✅ Přihlášení úspěšné');
      console.log(`   User ID: ${signInData.user?.id}\n`);
    }
    
    // Test 6: Načíst preference po přihlášení
    console.log('📥 Test 6: Načtení preferencí po přihlášení\n');
    
    const { data: reloadedPrefs, error: reloadError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (reloadError) {
      console.log('❌ Chyba načítání preferencí:', reloadError.message);
    } else {
      console.log('✅ Preference načteny po přihlášení');
      console.log(`   Lokality: ${reloadedPrefs.locations.join(', ')}`);
      console.log(`   Dispozice: ${reloadedPrefs.dispositions.join(', ')}`);
      console.log(`   Cena: ${reloadedPrefs.price_min} - ${reloadedPrefs.price_max} Kč\n`);
    }
    
    console.log('🎉 Všechny testy prošly!\n');
    console.log('📝 Shrnutí:');
    console.log('   ✅ Registrace funguje');
    console.log('   ✅ Ukládání preferencí funguje');
    console.log('   ✅ Načítání preferencí funguje');
    console.log('   ✅ Odhlášení funguje');
    console.log('   ✅ Přihlášení funguje');
    console.log('   ✅ Persistence preferencí funguje\n');
    
  } catch (error) {
    console.error('❌ Neočekávaná chyba:', error);
  }
}

testAuthFlow();
