#!/usr/bin/env node

/**
 * Test skript pro zjištění názvu listu v Google Sheets
 */

const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '12ZhQXFF_h-xyCB-nByNyE_mMBJ3M1BcgqQ2QshVk4Ck';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheetsClient = google.sheets({ version: 'v4', auth });
    
    console.log('🔍 Načítám metadata Google Sheets...\n');
    
    const response = await sheetsClient.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });

    console.log('📊 Informace o tabulce:');
    console.log(`   Název: ${response.data.properties.title}`);
    console.log(`   Počet listů: ${response.data.sheets.length}\n`);
    
    console.log('📄 Listy v tabulce:');
    response.data.sheets.forEach((sheet, index) => {
      console.log(`   ${index + 1}. "${sheet.properties.title}" (ID: ${sheet.properties.sheetId})`);
    });
    
    console.log(`\n✅ První list se jmenuje: "${response.data.sheets[0].properties.title}"`);
    console.log(`\nPoužijte tento název v CONFIG.SHEET_NAME v scraperu!\n`);
    
  } catch (error) {
    console.error('❌ Chyba:', error.message);
  }
}

main();
