#!/usr/bin/env node

/**
 * Sreality.cz Automatický Scraper s Google Sheets API
 * 
 * Tento scraper:
 * - Stahuje data ze Sreality.cz API
 * - Automaticky nahrává do Google Sheets
 * - Detekuje změny cen
 * - Označuje nové inzeráty
 * 
 * INSTALACE:
 * cd /home/user/workspace/scraper
 * npm install googleapis
 * 
 * POUŽITÍ:
 * node sreality-scraper-puppeteer.js
 */

const https = require('https');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// ============================================================================
// KONFIGURACE
// ============================================================================

const CONFIG = {
  SHEET_ID: '12ZhQXFF_h-xyCB-nByNyE_mMBJ3M1BcgqQ2QshVk4Ck',
  SHEET_NAME: 'Raw listings', // Název listu v Google Sheets
  SERVICE_ACCOUNT_PATH: path.join(__dirname, 'service-account.json'),
  
  PAGES_TO_SCRAPE: 10, // Kolik stránek načíst (1 stránka = ~20 inzerátů)
  
  FILTERS: {
    categoryMainCb: 1, // 1 = Byty
    categoryTypeCb: 1, // 1 = Prodej
    localityDistrictId: 72, // 72 = Praha
    perPage: 20,
  },
};

// ============================================================================
// GOOGLE SHEETS API
// ============================================================================

async function initGoogleSheets() {
  try {
    if (!fs.existsSync(CONFIG.SERVICE_ACCOUNT_PATH)) {
      throw new Error(`Service Account JSON soubor nenalezen: ${CONFIG.SERVICE_ACCOUNT_PATH}`);
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: CONFIG.SERVICE_ACCOUNT_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheetsClient = google.sheets({ version: 'v4', auth });
    
    console.log('✅ Google Sheets API připojeno');
    
    return sheetsClient;
  } catch (error) {
    console.error('❌ Chyba při připojení k Google Sheets API:', error.message);
    throw error;
  }
}

async function getExistingData(sheetsClient) {
  try {
    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: CONFIG.SHEET_ID,
      range: `${CONFIG.SHEET_NAME}!A:T`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return new Map();
    }

    // Přeskočit header
    const dataRows = rows.slice(1);
    const existingData = new Map();

    dataRows.forEach(row => {
      const hash_id = row[0];
      const cena = parseFloat(row[6]);
      if (hash_id && !isNaN(cena)) {
        existingData.set(hash_id, {
          cena,
          last_price: row[16] || '',
          price_changed_at: row[17] || '',
        });
      }
    });

    console.log(`📊 Načteno ${existingData.size} existujících inzerátů`);
    return existingData;
  } catch (error) {
    console.log('ℹ️  Žádná existující data (první spuštění)');
    return new Map();
  }
}

async function updateGoogleSheets(sheetsClient, listings, existingData) {
  const header = [
    'hash_id',
    'url',
    'titulek',
    'lokalita',
    'dispozice',
    'plocha_m2',
    'cena',
    'cena_za_m2',
    'patro',
    'stav_objektu',
    'image_url',
    'telefon',
    'vlozeno_at',
    'upraveno_at',
    'first_seen_at',
    'last_seen_at',
    'last_price',
    'price_changed_at',
    'status',
    'hypo_mesic',
  ];

  const now = new Date().toISOString();

  const values = listings.map(listing => {
    const existing = existingData.get(listing.hash_id);
    
    let last_price = '';
    let price_changed_at = '';
    let status = 'active';

    if (existing) {
      // Inzerát již existuje
      if (existing.cena !== listing.cena) {
        // Cena se změnila
        last_price = existing.cena.toString();
        price_changed_at = now;
        console.log(`💰 Změna ceny: ${listing.hash_id} (${existing.cena} → ${listing.cena})`);
      } else {
        // Cena stejná, zachovat historii
        last_price = existing.last_price;
        price_changed_at = existing.price_changed_at;
      }
    } else {
      // Nový inzerát
      status = 'new';
      console.log(`🆕 Nový inzerát: ${listing.hash_id}`);
    }

    return [
      listing.hash_id,
      listing.url,
      listing.titulek,
      listing.lokalita,
      listing.dispozice,
      listing.plocha_m2,
      listing.cena,
      listing.cena_za_m2,
      listing.patro,
      listing.stav_objektu,
      listing.image_url,
      listing.telefon,
      listing.vlozeno_at || now,
      now, // upraveno_at
      listing.first_seen_at || now,
      now, // last_seen_at
      last_price,
      price_changed_at,
      status,
      listing.hypo_mesic,
    ];
  });

  await sheetsClient.spreadsheets.values.update({
    spreadsheetId: CONFIG.SHEET_ID,
    range: `${CONFIG.SHEET_NAME}!A1`,
    valueInputOption: 'RAW',
    resource: {
      values: [header, ...values],
    },
  });

  console.log(`✅ Zapsáno ${values.length} inzerátů do Google Sheets`);
}

// ============================================================================
// SREALITY API SCRAPER
// ============================================================================

function fetchSrealityPage(page) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      category_main_cb: CONFIG.FILTERS.categoryMainCb,
      category_type_cb: CONFIG.FILTERS.categoryTypeCb,
      locality_district_id: CONFIG.FILTERS.localityDistrictId,
      per_page: CONFIG.FILTERS.perPage,
      page: page,
    });

    const url = `https://www.sreality.cz/api/cs/v2/estates?${params.toString()}`;
    
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    }, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

function parseEstate(estate) {
  const hash_id = estate.hash_id || String(estate.id || Math.random()).slice(2);
  
  // URL
  const seoLocality = estate.seo?.locality || 'praha';
  const url = `https://www.sreality.cz/detail/${seoLocality}/${hash_id}`;
  
  // Základní info
  const titulek = estate.name || 'Bez názvu';
  const lokalita = estate.locality || 'Praha';
  
  // Dispozice
  let dispozice = '2+kk';
  const dispoziceItem = estate.items?.find(item => item.name === 'Dispozice');
  if (dispoziceItem?.value) {
    dispozice = dispoziceItem.value;
  }
  
  // Plocha
  let plocha_m2 = 0;
  const plochaItem = estate.items?.find(item => 
    item.name === 'Užitná plocha' || item.name === 'Plocha'
  );
  if (plochaItem?.value) {
    const match = plochaItem.value.match(/(\d+)/);
    if (match) {
      plocha_m2 = parseInt(match[1], 10);
    }
  }
  
  // Cena
  const cena = estate.price || 0;
  const cena_za_m2 = plocha_m2 > 0 ? Math.round(cena / plocha_m2) : 0;
  
  // Patro
  let patro = '';
  const patroItem = estate.items?.find(item => item.name === 'Podlaží');
  if (patroItem?.value) {
    patro = patroItem.value;
  }
  
  // Stav objektu
  let stav_objektu = '';
  const stavItem = estate.items?.find(item => item.name === 'Stav objektu');
  if (stavItem?.value) {
    stav_objektu = stavItem.value;
  }
  
  // Obrázek - použít první obrázek z _links nebo placeholder
  let image_url = 'https://via.placeholder.com/800x600?text=Bez+obrazku';
  if (estate._links?.images?.[0]?.href) {
    image_url = estate._links.images[0].href;
  } else if (estate._embedded?.images?.[0]?.href) {
    image_url = estate._embedded.images[0].href;
  }
  
  // Hypotéka (zjednodušený výpočet: 80% LTV, 5% úrok, 20 let)
  const hypo_mesic = Math.round((cena * 0.8 * 0.05) / 12);
  
  // Datum
  const now = new Date().toISOString();
  
  return {
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
    telefon: '',
    vlozeno_at: now,
    first_seen_at: now,
    hypo_mesic,
  };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🚀 Spouštím automatický Sreality.cz scraper...\n');
  console.log(`📊 Konfigurace:`);
  console.log(`   - Sheet ID: ${CONFIG.SHEET_ID}`);
  console.log(`   - Stránek k načtení: ${CONFIG.PAGES_TO_SCRAPE}`);
  console.log(`   - Inzerátů na stránku: ${CONFIG.FILTERS.perPage}`);
  console.log(`   - Celkem očekáváno: ~${CONFIG.PAGES_TO_SCRAPE * CONFIG.FILTERS.perPage} inzerátů\n`);

  try {
    // Připojit k Google Sheets
    const sheetsClient = await initGoogleSheets();
    
    // Načíst existující data (pro detekci změn)
    const existingData = await getExistingData(sheetsClient);
    
    // Scrape Sreality.cz
    const allListings = [];
    
    for (let page = 1; page <= CONFIG.PAGES_TO_SCRAPE; page++) {
      console.log(`🔍 Načítám stránku ${page}/${CONFIG.PAGES_TO_SCRAPE}...`);
      
      const response = await fetchSrealityPage(page);
      
      if (!response._embedded?.estates || response._embedded.estates.length === 0) {
        console.log(`   ⚠️  Stránka ${page} neobsahuje žádné inzeráty`);
        break;
      }
      
      const estates = response._embedded.estates;
      console.log(`   ✅ Načteno ${estates.length} inzerátů`);
      
      for (const estate of estates) {
        const listing = parseEstate(estate);
        allListings.push(listing);
      }
      
      // Delay mezi requesty (aby Sreality nás nebanoval)
      if (page < CONFIG.PAGES_TO_SCRAPE) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n✅ Celkem načteno ${allListings.length} inzerátů\n`);
    
    // Nahrát do Google Sheets
    console.log('📤 Nahrávám data do Google Sheets...');
    await updateGoogleSheets(sheetsClient, allListings, existingData);
    
    console.log('\n🎉 HOTOVO!');
    console.log(`\n📱 V mobilní aplikaci:`);
    console.log(`   1. Otevřete obrazovku "Nemovitosti"`);
    console.log(`   2. Potáhněte dolů (pull to refresh)`);
    console.log(`   3. Uvidíte ${allListings.length} realitných inzerátů!\n`);
    
  } catch (error) {
    console.error('\n❌ Chyba:', error.message);
    console.error('\n📝 Zkontrolujte:');
    console.error('   1. Service Account JSON je v scraper/service-account.json');
    console.error('   2. Google Sheets je sdílený s:', 'reality-scraper@reality-v-kapse.iam.gserviceaccount.com');
    console.error('   3. Google Sheets API je zapnuté v Google Cloud Console\n');
    process.exit(1);
  }
}

// Spustit
main();
