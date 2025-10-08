require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUserPreferences() {
  console.log('\n🧪 Testování user_preferences tabulky...\n');
  
  // Test 1: Zkontrolovat existence
  console.log('📋 Test 1: Pokus o načtení z user_preferences\n');
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('❌ Chyba:', error.code, '-', error.message);
    if (error.code === '42P01') {
      console.log('\n⚠️  Tabulka user_preferences NEEXISTUJE!');
      console.log('   Musíme ji vytvořit.\n');
      return false;
    }
  } else {
    console.log('✅ Tabulka user_preferences existuje');
    console.log(`   Počet řádků: ${data?.length || 0}\n`);
    
    if (data && data.length > 0) {
      console.log('📊 Příklad záznamu:');
      console.log(JSON.stringify(data[0], null, 2));
    }
    return true;
  }
  
  // Test 2: Zkontrolovat user_profiles
  console.log('\n👤 Test 2: Pokus o načtení z user_profiles\n');
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('*')
    .limit(1);
  
  if (profilesError) {
    console.log('❌ Chyba:', profilesError.code, '-', profilesError.message);
    if (profilesError.code === '42P01') {
      console.log('\n⚠️  Tabulka user_profiles NEEXISTUJE!');
      console.log('   Musíme vytvořit celé user schema.\n');
    }
  } else {
    console.log('✅ Tabulka user_profiles existuje');
    console.log(`   Počet uživatelů: ${profiles?.length || 0}\n`);
  }
}

testUserPreferences();
