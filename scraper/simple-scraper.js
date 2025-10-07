#!/usr/bin/env node

/**
 * Jednoduchý Sreality.cz Scraper (BEZ SERVICE ACCOUNT)
 * 
 * Tento scraper vytvoří CSV soubor s testovacími daty ve správném formátu.
 * CSV můžete pak jednoduše zkopírovat do Google Sheets.
 * 
 * POUŽITÍ:
 * node scraper/simple-scraper.js
 * 
 * Výstup: scraper/output.csv
 */

const https = require('https');
const fs = require('fs');

// ============================================================================
// KONFIGURACE
// ============================================================================

const CONFIG = {
  OUTPUT_FILE: './scraper/scraped-data.csv',
  PAGES_TO_SCRAPE: 3, // Scrape 3 pages = ~60 listings
  
  FILTERS: {
    categoryMainCb: 1, // Byty
    categoryTypeCb: 1, // Prodej
    locality: 'Praha', // Praha
  },
};

// ============================================================================
// CSV HELPER
// ============================================================================

function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateCSV(listings) {
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

  const rows = listings.map(listing => [
    escapeCSV(listing.hash_id),
    escapeCSV(listing.url),
    escapeCSV(listing.titulek),
    escapeCSV(listing.lokalita),
    escapeCSV(listing.dispozice),
    escapeCSV(listing.plocha_m2),
    escapeCSV(listing.cena),
    escapeCSV(listing.cena_za_m2),
    escapeCSV(listing.patro),
    escapeCSV(listing.stav_objektu),
    escapeCSV(listing.image_url),
    escapeCSV(listing.telefon),
    escapeCSV(listing.vlozeno_at),
    escapeCSV(listing.upraveno_at),
    escapeCSV(listing.first_seen_at),
    escapeCSV(listing.last_seen_at),
    escapeCSV(listing.last_price),
    escapeCSV(listing.price_changed_at),
    escapeCSV(listing.status),
    escapeCSV(listing.hypo_mesic),
  ].join(','));

  return [header.join(','), ...rows].join('\n');
}

// ============================================================================
// SREALITY API
// ============================================================================

function fetchSrealityPage(page) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      category_main_cb: CONFIG.FILTERS.categoryMainCb,
      category_type_cb: CONFIG.FILTERS.categoryTypeCb,
      locality_district_id: 72, // Praha
      per_page: 20,
      page: page,
    });

    const url = `https://www.sreality.cz/api/cs/v2/estates?${params.toString()}`;
    
    console.log(`🔍 Načítám stránku ${page}...`);
    
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
  const hash_id = estate.hash_id || estate._embedded?.calculator?.hash_id || String(Math.random()).slice(2);
  const url = `https://www.sreality.cz/detail/${estate.seo?.locality || 'praha'}/${hash_id}`;
  
  const titulek = estate.name || 'Bez názvu';
  const lokalita = estate.locality || 'Praha';
  
  // Najít dispozici z items
  let dispozice = '2+kk';
  const dispoziceItem = estate.items?.find(item => item.name === 'Dispozice');
  if (dispoziceItem) {
    dispozice = dispoziceItem.value || '2+kk';
  }
  
  // Najít plochu
  let plocha_m2 = 0;
  const plochaItem = estate.items?.find(item => item.name === 'Užitná plocha');
  if (plochaItem) {
    const match = plochaItem.value?.match(/(\d+)/);
    if (match) {
      plocha_m2 = parseInt(match[1], 10);
    }
  }
  
  const cena = estate.price || 0;
  const cena_za_m2 = plocha_m2 > 0 ? Math.round(cena / plocha_m2) : 0;
  
  // Najít patro
  let patro = '';
  const patroItem = estate.items?.find(item => item.name === 'Podlaží');
  if (patroItem) {
    patro = patroItem.value || '';
  }
  
  // Najít stav
  let stav_objektu = '';
  const stavItem = estate.items?.find(item => item.name === 'Stav objektu');
  if (stavItem) {
    stav_objektu = stavItem.value || '';
  }
  
  // Obrázek
  const image_url = estate._links?.images?.[0]?.href || estate._embedded?.images?.[0]?.href || 'https://via.placeholder.com/800x600?text=Bez+obrázku';
  
  // Datum
  const now = new Date().toISOString();
  
  // Hypotéka (zjednodušený výpočet)
  const hypo_mesic = Math.round((cena * 0.8 * 0.05) / 12); // 80% LTV, 5% úrok, 20 let
  
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
    upraveno_at: now,
    first_seen_at: now,
    last_seen_at: now,
    last_price: '',
    price_changed_at: '',
    status: 'active',
    hypo_mesic,
  };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🚀 Spouštím Sreality.cz scraper...\n');
  console.log(`📊 Konfigurace:`);
  console.log(`   - Stránek k načtení: ${CONFIG.PAGES_TO_SCRAPE}`);
  console.log(`   - Výstupní soubor: ${CONFIG.OUTPUT_FILE}\n`);

  const allListings = [];

  try {
    for (let page = 1; page <= CONFIG.PAGES_TO_SCRAPE; page++) {
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
      
      // Delay between requests
      if (page < CONFIG.PAGES_TO_SCRAPE) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n✅ Celkem načteno ${allListings.length} inzerátů`);
    
    // Generate CSV
    const csv = generateCSV(allListings);
    
    // Save to file
    fs.writeFileSync(CONFIG.OUTPUT_FILE, csv, 'utf8');
    
    console.log(`\n💾 Data uložena do: ${CONFIG.OUTPUT_FILE}`);
    console.log(`\n📋 JAK NAHRÁT DO GOOGLE SHEETS:`);
    console.log(`   1. Otevřete soubor: ${CONFIG.OUTPUT_FILE}`);
    console.log(`   2. Zkopírujte VŠECHNA data (Ctrl+A, Ctrl+C)`);
    console.log(`   3. Otevřete Google Sheets: https://docs.google.com/spreadsheets/d/12ZhQXFF_h-xyCB-nByNyE_mMBJ3M1BcgqQ2QshVk4Ck/edit`);
    console.log(`   4. SMAZAT VŠECHNY řádky v tabulce (vyberte všechny a Delete)`);
    console.log(`   5. Klikněte na buňku A1`);
    console.log(`   6. Vložte data (Ctrl+V)`);
    console.log(`   7. V mobilní aplikaci potáhněte dolů pro refresh\n`);
    
  } catch (error) {
    console.error('\n❌ Chyba:', error.message);
    process.exit(1);
  }
}

main();
