// Test Supabase Connection
// Spusť: node test-supabase.js

const SUPABASE_URL = 'https://xhjkjcrjfwhrzjackboa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoamtqY3JqZndocnpqYWNrYm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NDQzODksImV4cCI6MjA3NTMyMDM4OX0.a0hVUjKG1SZQgm0HvFfFLZUZUs-e7snQYomLidjIn9U';

async function testSupabaseConnection() {
  console.log('🔍 Testuji Supabase připojení...\n');
  
  try {
    // Test 1: Check if Supabase URL is reachable
    console.log('Test 1: Kontroluji dostupnost Supabase URL...');
    const healthCheck = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
      }
    });
    
    if (healthCheck.ok) {
      console.log('✅ Supabase URL je dostupná\n');
    } else {
      console.log(`❌ Supabase URL vrátila chybu: ${healthCheck.status}\n`);
      return;
    }

    // Test 2: Try to register a test user
    console.log('Test 2: Zkouším registrovat testovacího uživatele...');
    const testEmail = `test${Date.now()}@test.cz`;
    const testPassword = 'test123456';
    
    const signUpResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        data: {
          full_name: 'Test User'
        }
      })
    });

    const signUpData = await signUpResponse.json();
    console.log('📊 Odpověď registrace:', JSON.stringify(signUpData, null, 2));

    if (signUpResponse.ok && signUpData.user) {
      console.log('✅ Registrace proběhla úspěšně!');
      console.log(`   User ID: ${signUpData.user.id}`);
      console.log(`   Email: ${signUpData.user.email}`);
      
      if (signUpData.session) {
        console.log('✅ Session byla vytvořena (email confirmation vypnuta)');
      } else {
        console.log('⚠️  Session nebyla vytvořena - pravděpodobně je vyžadována email konfirmace');
        console.log('   Musíte vypnout "Enable email confirmations" v Supabase Authentication settings');
      }
    } else {
      console.log('❌ Registrace selhala');
      if (signUpData.error) {
        console.log(`   Error: ${signUpData.error.message}`);
      }
    }

    // Test 3: Check if tables exist
    console.log('\nTest 3: Kontroluji existenci tabulek...');
    const tablesCheck = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
      }
    });

    if (tablesCheck.status === 200) {
      console.log('✅ Tabulka user_profiles existuje');
    } else if (tablesCheck.status === 404) {
      console.log('❌ Tabulka user_profiles neexistuje - musíte spustit SQL schema!');
    } else {
      console.log(`⚠️  Status: ${tablesCheck.status}`);
      const error = await tablesCheck.json();
      console.log(`   Error: ${JSON.stringify(error)}`);
    }

    console.log('\n📋 SOUHRN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (signUpResponse.ok && signUpData.session) {
      console.log('✅ Supabase je správně nakonfigurovaný a funguje!');
    } else if (signUpResponse.ok && !signUpData.session) {
      console.log('⚠️  Supabase funguje, ale vyžaduje email konfirmaci');
      console.log('   Řešení: V Supabase Dashboard → Authentication → Settings');
      console.log('   Vypněte "Enable email confirmations"');
    } else {
      console.log('❌ Supabase nefunguje správně');
      console.log('   Zkontrolujte URL a ANON_KEY v .env souboru');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Neočekávaná chyba:', error.message);
  }
}

testSupabaseConnection();
