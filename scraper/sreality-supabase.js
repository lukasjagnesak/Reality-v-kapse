#!/usr/bin/env node
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const CONFIG = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  PAGES_TO_SCRAPE: 5,
  SEARCH_PARAMS: { category_main_cb: 1, category_type_cb: 1, locality_region_id: 10, per_page: 20 },
};

let supabase = null;

function initSupabase() {
  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_SERVICE_KEY) {
    throw new Error('Missing Supabase config!');
  }
  supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_KEY);
  console.log('Supabase client initialized');
}

async function fetchPage(page = 1) {
  try {
    const response = await axios.get('https://www.sreality.cz/api/cs/v2/estates', {
      params: { ...CONFIG.SEARCH_PARAMS, page },
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    console.error(`Error loading page ${page}:`, error.message);
    return null;
  }
}

function parseDisposition(name) {
  const disps = ['1+kk', '1+1', '2+kk', '2+1', '3+kk', '3+1', '4+kk', '4+1'];
  for (const d of disps) if (name.toLowerCase().includes(d)) return d;
  return '2+kk';
}

function processEstate(e) {
  try {
    const name = e.name || '';
    const locality = e.locality || '';
    const price = e.price || 0;
    const area = e.surface || e.usable_area || 60;
    const imageUrl = e._links?.images?.[0]?.href ? `https:${e._links.images[0].href}` : 'https://via.placeholder.com/800x600';

    return {
      id: e.hash_id,
      hash_id: e.hash_id,
      title: name,
      description: name,
      price: price,
      area: area,
      price_per_m2: Math.round(price / area),
      location: locality,
      type: 'byt',
      disposition: parseDisposition(name),
      rating: 'B',
      discount_percentage: Math.floor(Math.random() * 15),
      image_url: imageUrl,
      source: 'sreality',
      source_url: `https://www.sreality.cz/detail/prodej/byt/${e.hash_id}`,
      status: 'active',
      last_seen_at: new Date().toISOString(),
    };
  } catch (error) {
    return null;
  }
}

async function upsertProperty(prop) {
  try {
    const { data, error } = await supabase.from('properties').upsert(prop, { onConflict: 'hash_id' });
    if (error) {
      console.error(`\n❌ Upsert error for ${prop.hash_id}:`, error.message, error.details);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`\n❌ Unexpected error:`, error.message);
    return false;
  }
}

async function scrape() {
  console.log('Starting scraper...');
  let totalProcessed = 0, totalSaved = 0;

  for (let page = 1; page <= CONFIG.PAGES_TO_SCRAPE; page++) {
    const data = await fetchPage(page);
    if (!data || !data._embedded?.estates) continue;

    console.log(`Page ${page}: ${data._embedded.estates.length} properties`);

    for (const estate of data._embedded.estates) {
      totalProcessed++;
      const property = processEstate(estate);
      if (property && await upsertProperty(property)) {
        totalSaved++;
        process.stdout.write(`${totalSaved}/${totalProcessed} `);
      }
    }
    console.log('');
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\nDone! Processed: ${totalProcessed}, Saved: ${totalSaved}`);
}

async function main() {
  try {
    initSupabase();
    await scrape();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) main();
