require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUserPreferences() {
  console.log('\n🧪 Testování user_preferences tabulky...\n');
  
  // Test 1: Zkontrolovat, zda tabulka existuje
  console.log('📋 Test 1: Existence tabulky user_preferences\n');
  const { data: tables, error: tablesError } = await supabase
    .rpc('get_table_info', { table_name: 'user_preferences' })
    .catch(() => ({ data: null, error: 'RPC neexistuje' }));
  
  // Zkusme prostý SELECT
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .limit(1);
  
  if (error) {
    if (error.code === '42P01') {
      console.log('❌ Tabulka user_preferences NEEXISTUJE');
      console.log('   Musíme ji vytvořit!\n');
    } else if (error.code === 'PGRST116') {
      console.log('⚠️  Tabulka existuje, ale RLS zablokoval přístup (to je OK pro nepřihlášeného)');
      console.log('   Error:', error.message, '\n');
    } else {
      console.log('⚠️  Jiná chyba:', error.code, error.message, '\n');
    }
  } else {
    console.log('✅ Tabulka user_preferences existuje');
    console.log(`   Počet řádků: ${data?.length || 0}\n`);
  }
  
  // Test 2: Zkontrolovat RLS policies
  console.log('🔒 Test 2: RLS policies\n');
  const { data: policies, error: policiesError } = await supabase
    .rpc('get_policies', { table_name: 'user_preferences' })
    .catch(() => ({ data: null, error: 'RPC neexistuje' }));
  
  if (policiesError) {
    console.log('   ⚠️  Nelze načíst policies (to je OK)');
  } else {
    console.log('   ✅ Policies načteny:', policies?.length || 0);
  }
}

testUserPreferences();
