#!/usr/bin/env node

/**
 * Sreality.cz Scraper s Puppeteer (DOPORUČENO)
 * 
 * Tento skript používá Puppeteer pro skutečné procházení Sreality.cz
 * Lepší než Cheerio, protože:
 * - Renderuje JavaScript
 * - Obchází anti-scraping ochranu
 * - Získá všechna dynamicky načtená data
 * 
 * INSTALACE:
 * cd scraper
 * npm install puppeteer googleapis dotenv
 * 
 * POUŽITÍ:
 * node scraper/sreality-scraper-puppeteer.js
 */

const puppeteer = require('puppeteer');
const { google } = require('googleapis');
require('dotenv').config({ path: '../.env' });

// ============================================================================
// KONFIGURACE
// ============================================================================

const CONFIG = {
  SHEET_ID: process.env.EXPO_PUBLIC_GOOGLE_SHEETS_ID,
  SHEET_NAME: 'Inzeráty',
  PAGES_TO_SCRAPE: 10,
  
  FILTERS: {
    transactionType: 'prodej',
    propertyType: 'byty',
    locations: ['praha-2', 'praha-3', 'praha-4', 'praha-5', 'praha-6', 'praha-7', 'praha-8', 'praha-9', 'praha-10'],
    disposition: '1+kk',
    ownership: 'osobni',
  },
  
  HEADLESS: true, // true = bez viditelného prohlížeče, false = viditelný (pro debugging)
  DELAY_BETWEEN_PAGES: 3000, // ms
};

// ============================================================================
// GOOGLE SHEETS API
// ============================================================================

async function initGoogleSheets() {
  // DŮLEŽITÉ: Musíte vytvořit Service Account:
  // 1. Jděte na https://console.cloud.google.com/
  // 2. Vytvořte nový projekt nebo vyberte existující
  // 3. Zapněte Google Sheets API
  // 4. Vytvořte Service Account
  // 5. Stáhněte JSON klíč
  // 6. Sdílejte Google Sheets s emailem service accountu
  
  const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH || './service-account.json';
  
  const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheetsClient = google.sheets({ version: 'v4', auth });
  
  console.log('✅ Google Sheets API připojeno');
  
  return sheetsClient;
}

async function updateGoogleSheets(sheetsClient, data) {
  const header = [
    'ID', 'Název', 'Popis', 'Cena', 'Plocha', 'Lokalita', 'Typ', 
    'Dispozice', 'Sleva v %', 'URL obrázku', 'URL inzerátu', 
    'Jméno makléře', 'Telefon makléře', 'Email makléře', 'Společnost'
  ];

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
    item.agentCompany || 'Sreality.cz',
  ]);

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
// PUPPETEER SCRAPER
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

async function scrapeWithPuppeteer() {
  console.log('🚀 Spouštím Puppeteer scraper...\n');

  const browser = await puppeteer.launch({
    headless: CONFIG.HEADLESS,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  
  // Nastavit user agent
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  // Nastavit viewport
  await page.setViewport({ width: 1920, height: 1080 });

  const allListings = [];

  try {
    for (let pageNum = 1; pageNum <= CONFIG.PAGES_TO_SCRAPE; pageNum++) {
      const url = buildSrealityUrl(pageNum);
      
      console.log(`🔍 Načítám stránku ${pageNum}...`);
      console.log(`   ${url}\n`);

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Počkat na načtení inzerátů
      await page.waitForSelector('.property', { timeout: 10000 }).catch(() => {
        console.log('   ⚠️  Nenalezeny žádné inzeráty na této stránce');
      });

      // Extrahovat data pomocí page.evaluate
      const listings = await page.evaluate(() => {
        const results = [];
        const propertyElements = document.querySelectorAll('.property');

        propertyElements.forEach((elem, index) => {
          try {
            // UPRAVTE SELEKTORY podle skutečné struktury Sreality.cz!
            
            const titleElem = elem.querySelector('.name, .title, h2');
            const priceElem = elem.querySelector('.price, .norm-price');
            const locationElem = elem.querySelector('.locality, .location');
            const infoElem = elem.querySelector('.info, .params');
            const linkElem = elem.querySelector('a');
            const imgElem = elem.querySelector('img');

            const title = titleElem?.textContent?.trim() || '';
            const priceText = priceElem?.textContent?.trim() || '0';
            const location = locationElem?.textContent?.trim() || '';
            const info = infoElem?.textContent?.trim() || '';
            const href = linkElem?.href || '';
            const imgSrc = imgElem?.src || imgElem?.dataset?.src || '';

            // Extrahovat cenu
            const priceMatch = priceText.match(/[\d\s]+/);
            const price = priceMatch ? parseInt(priceMatch[0].replace(/\s/g, '')) : 0;

            // Extrahovat plochu
            const areaMatch = info.match(/(\d+)\s*m²/);
            const area = areaMatch ? parseInt(areaMatch[1]) : 0;

            // Extrahovat dispozici
            const dispositionMatch = title.match(/(\d\+(?:kk|1))/i);
            const disposition = dispositionMatch ? dispositionMatch[1].toLowerCase() : '';

            if (title && price > 0) {
              results.push({
                title,
                price,
                location,
                area,
                disposition,
                sourceUrl: href,
                imageUrl: imgSrc,
                info,
              });
            }
          } catch (error) {
            console.error('Chyba při zpracování inzerátu:', error);
          }
        });

        return results;
      });

      console.log(`   ✓ Nalezeno ${listings.length} inzerátů\n`);

      // Přidat metadata
      listings.forEach((listing, index) => {
        listing.id = `sreality-${Date.now()}-${pageNum}-${index}`;
        listing.type = CONFIG.FILTERS.propertyType === 'byty' ? 'byt' : 'dům';
        listing.description = listing.info || 'Detailní popis není k dispozici';
        listing.discountPercentage = 0; // Vypočítá se později
        listing.agentName = '';
        listing.agentPhone = '';
        listing.agentEmail = '';
        listing.agentCompany = 'Sreality.cz';
        
        // Vyčistit URL obrázku
        if (listing.imageUrl && !listing.imageUrl.startsWith('http')) {
          listing.imageUrl = 'https:' + listing.imageUrl;
        }
      });

      allListings.push(...listings);

      // Delay mezi stránkami
      if (pageNum < CONFIG.PAGES_TO_SCRAPE) {
        console.log(`   ⏳ Čekám ${CONFIG.DELAY_BETWEEN_PAGES / 1000}s před další stránkou...\n`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_PAGES));
      }
    }

    console.log(`\n✅ Celkem načteno ${allListings.length} inzerátů\n`);

  } catch (error) {
    console.error('❌ Chyba při scrapování:', error.message);
  } finally {
    await browser.close();
  }

  return allListings;
}

// ============================================================================
// HLAVNÍ FUNKCE
// ============================================================================

async function main() {
  console.log('=' .repeat(70));
  console.log('Reality v Kapse - Sreality.cz Scraper');
  console.log('=' .repeat(70));
  console.log(`Čas: ${new Date().toLocaleString('cs-CZ')}\n`);

  try {
    // 1. Scrapovat Sreality.cz
    const listings = await scrapeWithPuppeteer();

    if (listings.length === 0) {
      console.log('⚠️  Nenalezeny žádné inzeráty. Zkontrolujte filtrační parametry.');
      return;
    }

    // 2. Připojit k Google Sheets
    console.log('📊 Připojuji se k Google Sheets...');
    const sheetsClient = await initGoogleSheets();

    // 3. Zapsat data
    console.log('📝 Zapisuji data...');
    await updateGoogleSheets(sheetsClient, listings);

    console.log('\n' + '='.repeat(70));
    console.log('✅ HOTOVO!');
    console.log('='.repeat(70));
    console.log(`\nZapsáno ${listings.length} inzerátů`);
    console.log(`Zobrazit v Google Sheets:`);
    console.log(`https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/edit\n`);

  } catch (error) {
    console.error('\n❌ CHYBA:', error.message);
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

module.exports = { main, scrapeWithPuppeteer };
