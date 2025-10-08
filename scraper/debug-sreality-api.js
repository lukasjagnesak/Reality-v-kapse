#!/usr/bin/env node

/**
 * Debug skript pro zjištění struktury dat ze Sreality API
 */

const https = require('https');

function fetchSrealityPage(page) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      category_main_cb: 1,
      category_type_cb: 1,
      locality_district_id: 72,
      per_page: 2,
      page: 1,
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

async function main() {
  console.log('🔍 Načítám data ze Sreality API...\n');
  
  const response = await fetchSrealityPage(1);
  
  if (!response._embedded?.estates || response._embedded.estates.length === 0) {
    console.log('Žádná data!');
    return;
  }
  
  const firstEstate = response._embedded.estates[0];
  
  console.log('📊 Struktura prvního inzerátu:\n');
  console.log(JSON.stringify(firstEstate, null, 2));
}

main();
