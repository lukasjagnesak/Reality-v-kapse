#!/usr/bin/env node

/**
 * Sreality.cz Scraper pro Reality v Kapse
 * 
 * Tento skript automaticky scrapuje Sreality.cz a nahrává data do Google Sheets.
 * 
 * INSTALACE:
 * npm install axios cheerio googleapis dotenv
 * 
 * POUŽITÍ:
 * node scraper/sreality-scraper.js
 * 
 * PRO CRON (každých 10 minut):
 * */10 * * * * cd /path/to/project && node scraper/sreality-scraper.js >> scraper.log 2>&1
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { google } = require('googleapis');
require('dotenv').config();

// ============================================================================
// KONFIGURACE
// ============================================================================

const CONFIG = {
  // Google Sheets
  SHEET_ID: process.env.GOOGLE_SHEETS_ID || process.env.EXPO_PUBLIC_GOOGLE_SHEETS_ID,
  SHEET_NAME: 'Inzeráty', // Název listu v Google Sheets
  
  // Sreality.cz parametry
  PAGES_TO_SCRAPE: 10, // Počet stránek k prohledání
  ITEMS_PER_PAGE: 20, // Sreality má 20 inzerátů na stránku
  
  // Filtrační parametry (lze upravit)
  FILTERS: {
    transactionType: 'prodej', // prodej | pronajem
    propertyType: 'byty', // byty | domy | pozemky | komercni
    locations: ['praha-2', 'praha-3', 'praha-4', 'praha-5', 'praha-6', 'praha-7', 'praha-8', 'praha-9', 'praha-10'],
    disposition: '1+kk', // 1+kk, 2+kk, atd.
    ownership: 'osobni', // osobni | druzstevni | statu-obce
  },
  
  // Detekce změn
  CHECK_INTERVAL_MINUTES: 10,
  NEW_LISTING_THRESHOLD_HOURS: 24, // Označit jako "nový" pokud je mladší než 24h
};

// ============================================================================
// GOOGLE SHEETS API
// ============================================================================

let sheetsClient = null;

async function initGoogleSheets() {
  // Pro jednoduchost používáme service account
  // V produkci použijte OAuth2 nebo service account s JSON key
  
  const auth = new google.auth.GoogleAuth({
    // Použijte jednu z těchto možností:
    
    // 1. Service Account JSON (doporučeno pro automatizaci)
    // keyFile: './service-account-key.json',
    
    // 2. Nebo nastavte GOOGLE_APPLICATION_CREDENTIALS environment variable
    // export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
    
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
  
  console.log('✅ Google Sheets API inicializováno');
}

async function readExistingData() {
  try {
    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: CONFIG.SHEET_ID,
      range: `${CONFIG.SHEET_NAME}!A:O`, // Všechny sloupce
    });

    const rows = response.data.values || [];
    
    // Přeskočit header
    if (rows.length > 1) {
      return rows.slice(1);
    }
    
    return [];
  } catch (error) {
    if (error.code === 404) {
      console.log('⚠️  List neexistuje, bude vytvořen');
      return [];
    }
    throw error;
  }
}

async function writeToGoogleSheets(data) {
  // Příprava dat pro Google Sheets
  const values = data.map(item => [
    item.id,
    item.title,
    item.description,
    item.price,
    item.area,
    item.location,
    item.type,
    item.disposition,
    item.discountPercentage || 0,
    item.imageUrl,
    item.sourceUrl,
    item.agentName || '',
    item.agentPhone || '',
    item.agentEmail || '',
    item.agentCompany || '',
  ]);

  // Header řádek
  const header = [
    'ID', 'Název', 'Popis', 'Cena', 'Plocha', 'Lokalita', 'Typ', 
    'Dispozice', 'Sleva v %', 'URL obrázku', 'URL inzerátu', 
    'Jméno makléře', 'Telefon makléře', 'Email makléře', 'Společnost'
  ];

  await sheetsClient.spreadsheets.values.update({
    spreadsheetId: CONFIG.SHEET_ID,
    range: `${CONFIG.SHEET_NAME}!A1:O${values.length + 1}`,
    valueInputOption: 'RAW',
    resource: {
      values: [header, ...values],
    },
  });

  console.log(`✅ Zapsáno ${values.length} záznamů do Google Sheets`);
}

// ============================================================================
// SREALITY.CZ SCRAPER
// ============================================================================

function buildSrealityUrl(page = 1) {
  const { transactionType, propertyType, locations, disposition, ownership } = CONFIG.FILTERS;
  
  const baseUrl = 'https://www.sreality.cz/hledani';
  const locationStr = locations.join(',');
  
  let url = `${baseUrl}/${transactionType}/${propertyType}/${locationStr}`;
  
  const params = new URLSearchParams();
  
  if (disposition) {
    params.append('velikost', disposition);
  }
  
  if (ownership) {
    params.append('vlastnictvi', ownership);
  }
  
  if (page > 1) {
    params.append('strana', page);
  }

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

async function scrapeSrealityPage(pageNum) {
  const url = buildSrealityUrl(pageNum);
  
  console.log(`🔍 Scrapuji stránku ${pageNum}: ${url}`);

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'cs,en-US;q=0.7,en;q=0.3',
      },
    });

    const $ = cheerio.load(response.data);
    const listings = [];

    // Sreality.cz používá různé selektory v závislosti na verzi stránky
    // Budeme muset přizpůsobit podle skutečné HTML struktury
    
    // Příklad selektorů (je třeba ověřit na skutečné stránce):
    $('.property').each((index, element) => {
      const $elem = $(element);
      
      const listing = {
        id: `sreality-${Date.now()}-${pageNum}-${index}`,
        title: $elem.find('.name').text().trim(),
        price: extractPrice($elem.find('.price').text()),
        location: $elem.find('.locality').text().trim(),
        disposition: extractDisposition($elem.find('.name').text()),
        area: extractArea($elem.find('.info').text()),
        imageUrl: $elem.find('img').attr('src') || '',
        sourceUrl: 'https://www.sreality.cz' + $elem.find('a').attr('href'),
        description: $elem.find('.description').text().trim() || 'Popis není k dispozici',
        type: CONFIG.FILTERS.propertyType === 'byty' ? 'byt' : 'dům',
        discountPercentage: 0, // Bude vypočítáno později
        agentName: '',
        agentPhone: '',
        agentEmail: '',
        agentCompany: '',
      };

      if (listing.title && listing.price > 0) {
        listings.push(listing);
      }
    });

    console.log(`   ✓ Nalezeno ${listings.length} inzerátů`);
    
    return listings;
  } catch (error) {
    console.error(`❌ Chyba při scrapování stránky ${pageNum}:`, error.message);
    return [];
  }
}

async function scrapeDetailPage(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    
    // Extrahovat detailní informace
    const details = {
      description: $('.description').text().trim(),
      agentName: $('.name-broker').text().trim(),
      agentPhone: $('.phone-broker').text().trim(),
      agentEmail: $('.email-broker').text().trim(),
    };

    return details;
  } catch (error) {
    console.error(`❌ Chyba při načítání detailu:`, error.message);
    return {};
  }
}

// ============================================================================
// UTILITY FUNKCE
// ============================================================================

function extractPrice(priceText) {
  const match = priceText.match(/[\d\s]+/);
  if (!match) return 0;
  return parseInt(match[0].replace(/\s/g, ''));
}

function extractArea(text) {
  const match = text.match(/(\d+)\s*m²/);
  return match ? parseInt(match[1]) : 0;
}

function extractDisposition(text) {
  const match = text.match(/(\d\+(?:kk|1))/i);
  return match ? match[1].toLowerCase() : '2+kk';
}

function calculateDiscount(price, area, averagePrice) {
  const pricePerM2 = price / area;
  return ((averagePrice - pricePerM2) / averagePrice * 100).toFixed(2);
}

// ============================================================================
// DETEKCE ZMĚN
// ============================================================================

async function detectChanges(oldData, newData) {
  const oldMap = new Map(oldData.map(row => [row[0], row])); // ID -> row
  const newMap = new Map(newData.map(item => [item.id, item]));
  
  const changes = {
    newListings: [],
    priceChanges: [],
    removed: [],
  };

  // Najít nové inzeráty
  for (const [id, item] of newMap) {
    if (!oldMap.has(id)) {
      changes.newListings.push(item);
    }
  }

  // Najít změny cen
  for (const [id, oldRow] of oldMap) {
    if (newMap.has(id)) {
      const oldPrice = parseFloat(oldRow[3]); // Sloupec Cena
      const newItem = newMap.get(id);
      const newPrice = newItem.price;

      if (oldPrice !== newPrice) {
        changes.priceChanges.push({
          id,
          title: newItem.title,
          oldPrice,
          newPrice,
          difference: newPrice - oldPrice,
          percentChange: ((newPrice - oldPrice) / oldPrice * 100).toFixed(2),
        });
      }
    }
  }

  // Najít odstraněné inzeráty
  for (const [id] of oldMap) {
    if (!newMap.has(id)) {
      changes.removed.push(id);
    }
  }

  return changes;
}

function sendNotifications(changes) {
  if (changes.newListings.length > 0) {
    console.log(`\n🆕 ${changes.newListings.length} nových inzerátů:`);
    changes.newListings.slice(0, 5).forEach(item => {
      console.log(`   • ${item.title} - ${item.price.toLocaleString('cs-CZ')} Kč`);
    });
  }

  if (changes.priceChanges.length > 0) {
    console.log(`\n💰 ${changes.priceChanges.length} změn cen:`);
    changes.priceChanges.forEach(change => {
      const emoji = change.difference < 0 ? '📉' : '📈';
      console.log(`   ${emoji} ${change.title}`);
      console.log(`      ${change.oldPrice.toLocaleString('cs-CZ')} Kč → ${change.newPrice.toLocaleString('cs-CZ')} Kč (${change.percentChange}%)`);
    });
  }

  if (changes.removed.length > 0) {
    console.log(`\n🗑️  ${changes.removed.length} odebraných inzerátů`);
  }

  // TODO: Implementovat skutečné notifikace (email, push, Slack, atd.)
}

// ============================================================================
// HLAVNÍ FUNKCE
// ============================================================================

async function main() {
  console.log('🚀 Spouštím Sreality.cz scraper...\n');
  console.log(`📅 ${new Date().toLocaleString('cs-CZ')}\n`);

  try {
    // 1. Inicializovat Google Sheets API
    await initGoogleSheets();

    // 2. Načíst existující data
    console.log('📖 Načítám existující data...');
    const existingData = await readExistingData();
    console.log(`   ✓ Nalezeno ${existingData.length} existujících záznamů\n`);

    // 3. Scrapovat Sreality.cz
    console.log(`🔍 Scrapuji ${CONFIG.PAGES_TO_SCRAPE} stránek...\n`);
    
    const allListings = [];
    
    for (let page = 1; page <= CONFIG.PAGES_TO_SCRAPE; page++) {
      const listings = await scrapeSrealityPage(page);
      allListings.push(...listings);
      
      // Delay mezi požadavky (být slušný k serveru)
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n✅ Celkem nalezeno ${allListings.length} inzerátů\n`);

    // 4. Detekovat změny
    if (existingData.length > 0) {
      console.log('🔍 Detekuji změny...');
      const changes = await detectChanges(existingData, allListings);
      sendNotifications(changes);
    }

    // 5. Zapsat do Google Sheets
    console.log('\n📝 Zapisuji do Google Sheets...');
    await writeToGoogleSheets(allListings);

    console.log('\n✅ Hotovo!\n');
    
  } catch (error) {
    console.error('\n❌ Chyba:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// ============================================================================
// SPUŠTĚNÍ
// ============================================================================

if (require.main === module) {
  main();
}

module.exports = { main, scrapeSrealityPage, buildSrealityUrl };
