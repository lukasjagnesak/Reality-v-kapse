// Quick script to run SQL fix via Supabase client
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runFix() {
  console.log('🔧 Odstraňuji UNIQUE constraint z hash_id...\n');
  
  // Drop unique constraint
  const { error } = await supabase.rpc('exec_sql', {
    query: 'ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_hash_id_key;'
  });
  
  if (error) {
    console.log('⚠️  RPC funkce neexistuje, zkouším přímý SQL...\n');
    
    // Try direct approach - drop and recreate without unique
    const { data, error: dropError } = await supabase
      .from('properties')
      .select('hash_id, id')
      .limit(1);
    
    if (dropError) {
      console.error('❌ Chyba:', dropError);
      console.log('\n💡 Prosím, spusťte tento SQL manuálně v Supabase Dashboard:');
      console.log('   ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_hash_id_key;\n');
      process.exit(1);
    }
    
    console.log('✅ Constraint lze odstranit pouze přes SQL Editor v Dashboard');
    console.log('\n📋 Zkopírujte tento SQL a spusťte ho na:');
    console.log('   https://supabase.com/dashboard/project/xhjkjcrjfwhrzjackboa/sql/new\n');
    console.log('ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_hash_id_key;\n');
  } else {
    console.log('✅ UNIQUE constraint odstraněn!\n');
  }
}

runFix();
