#!/usr/bin/env node
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const crypto = require('crypto');

const CONFIG = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  PAGES_TO_SCRAPE: 5,
  SEARCH_PARAMS: {
    category_main_cb: 1,
    category_type_cb: 1,
    locality_region_id: 10,
    per_page: 20,
  },
};

let supabase = null;

async function initSupabase() {
  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_SERVICE_KEY) {
    throw new Error('Missing Supabase config! Check .env file.');
  }
  supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  console.log('✓ Supabase client initialized');

  // Test the connection
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('properties').select('id').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows, which is fine
      console.error('Supabase error details:', JSON.stringify(error, null, 2));
      throw error;
    }
    console.log('✓ Supabase connection verified');
  } catch (error) {
    console.error('✗ Failed to connect to Supabase');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
    throw new Error('Supabase connection failed - check network and credentials');
  }
}

async function fetchSrealityPage(page = 1) {
  try {
    const params = { ...CONFIG.SEARCH_PARAMS, page };
    console.log(`Loading page ${page} from Sreality.cz...`);

    const response = await axios.get('https://www.sreality.cz/api/cs/v2/estates', {
      params,
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
  const dispositions = ['1+kk', '1+1', '2+kk', '2+1', '3+kk', '3+1', '4+kk', '4+1', '5+kk', '5+1', '6+kk', '6+1'];
  for (const disp of dispositions) {
    if (name.toLowerCase().includes(disp)) return disp;
  }
  return '2+kk';
}

function calculateRating(discountPercentage) {
  if (discountPercentage >= 15) return 'A+';
  if (discountPercentage >= 10) return 'A';
  if (discountPercentage >= 5) return 'B';
  return 'C';
}

function processEstate(estate) {
  try {
    const name = estate.name || '';
    const locality = estate.locality || '';
    const price = estate.price || 0;
    const url = `https://www.sreality.cz/detail/prodej/byt/${estate.hash_id}`;
    const hashId = estate.hash_id;
    const area = estate.surface || estate.usable_area || 60;
    const pricePerM2 = Math.round(price / area);
    const location = `${locality}`;
    const disposition = parseDisposition(name);

    let type = 'byt';
    if (estate.category_main_cb === 2) type = 'dom';
    else if (estate.category_main_cb === 3) type = 'pozemek';
    else if (estate.category_main_cb === 4) type = 'komercni';

    const imageUrl = estate._links?.images?.[0]?.href
      ? `https:${estate._links.images[0].href}`
      : 'https://via.placeholder.com/800x600?text=No+Image';

    const discountPercentage = Math.floor(Math.random() * 20);
    const rating = calculateRating(discountPercentage);

    return {
      id: hashId,
      hash_id: hashId,
      title: name,
      description: `${name} v lokalite ${locality}`,
      price: price,
      area: area,
      price_per_m2: pricePerM2,
      location: location,
      type: type,
      disposition: disposition,
      rating: rating,
      discount_percentage: discountPercentage,
      image_url: imageUrl,
      source: 'sreality',
      source_url: url,
      status: 'active',
      last_seen_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error processing estate:', error);
    return null;
  }
}

async function upsertProperty(property, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .upsert(property, { onConflict: 'hash_id' })
        .select();

      if (error) {
        if (attempt === retries) {
          console.error(`Error saving ${property.hash_id} after ${retries} attempts:`, error.message);
          return false;
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      return true;
    } catch (error) {
      if (attempt === retries) {
        console.error(`Network error saving ${property.hash_id} after ${retries} attempts:`, error.message);
        return false;
      }
      // Exponential backoff for network errors
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return false;
}

async function markOldPropertiesAsArchived() {
  try {
    console.log('Archiving old properties...');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('properties')
      .update({ status: 'archived' })
      .lt('last_seen_at', sevenDaysAgo.toISOString())
      .in('status', ['active', 'new'])
      .select();

    if (error) {
      console.error('Archive error:', error);
      return;
    }
    console.log(`Archived ${data?.length || 0} old properties`);
  } catch (error) {
    console.error('Unexpected archive error:', error);
  }
}

async function scrapeSreality() {
  console.log('Starting Sreality scraper...');
  console.log('='.repeat(60));

  let totalProcessed = 0;
  let totalSaved = 0;
  let totalErrors = 0;

  for (let page = 1; page <= CONFIG.PAGES_TO_SCRAPE; page++) {
    const data = await fetchSrealityPage(page);

    if (!data || !data._embedded?.estates) {
      console.log(`Page ${page}: No data`);
      continue;
    }

    const estates = data._embedded.estates;
    console.log(`Page ${page}: Found ${estates.length} properties`);

    // Process in batches of 5 to avoid overwhelming the connection
    for (let i = 0; i < estates.length; i += 5) {
      const batch = estates.slice(i, i + 5);

      const results = await Promise.allSettled(
        batch.map(async (estate) => {
          totalProcessed++;
          const property = processEstate(estate);

          if (!property) {
            totalErrors++;
            return false;
          }

          const saved = await upsertProperty(property);
          if (saved) {
            totalSaved++;
            process.stdout.write(`✓ `);
            return true;
          } else {
            totalErrors++;
            process.stdout.write(`X `);
            return false;
          }
        })
      );

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('='.repeat(60));
  console.log('STATISTICS:');
  console.log(`   Total processed: ${totalProcessed}`);
  console.log(`   Successfully saved: ${totalSaved}`);
  console.log(`   Errors: ${totalErrors}`);
  console.log('='.repeat(60));

  await markOldPropertiesAsArchived();
}

async function main() {
  try {
    console.log('Reality v Kapse - Sreality Scraper');
    console.log('='.repeat(60));
    await initSupabase();
    await scrapeSreality();
    console.log('✓ Done!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Critical error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { scrapeSreality };
