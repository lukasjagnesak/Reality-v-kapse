// Realty Service - Supabase API
// Služba pro načítání nemovitostí z Supabase databáze
import { supabase } from './supabase';
import type { Property, PropertyType, PropertyDisposition, PropertyRating } from '../types/property';

/**
 * Načte všechny aktivní nemovitosti z Supabase
 */
export async function fetchPropertiesFromSupabase(): Promise<Property[]> {
  console.log('📡 Načítám nemovitosti z Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('status', ['active', 'new'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('⚠️  Žádná data v Supabase');
      return [];
    }

    console.log(`✅ Načteno ${data.length} nemovitostí z Supabase`);

    // Transform database rows to Property objects
    const properties: Property[] = data.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || 'Popis není k dispozici',
      price: row.price,
      area: row.area,
      pricePerM2: row.price_per_m2 || Math.round(row.price / row.area),
      location: row.location,
      type: row.type as PropertyType,
      disposition: row.disposition as PropertyDisposition,
      rating: row.rating as PropertyRating,
      discountPercentage: row.discount_percentage || 0,
      imageUrl: row.image_url || 'https://via.placeholder.com/800x600?text=Bez+obrázku',
      source: row.source || 'sreality',
      sourceUrl: row.source_url || '',
      createdAt: new Date(row.created_at),
      isNew: row.status === 'new',
      priceHistory: row.last_price ? {
        oldPrice: row.last_price,
        newPrice: row.price,
        changedAt: new Date(row.price_changed_at),
      } : undefined,
      agent: row.agent_name ? {
        name: row.agent_name,
        phone: row.agent_phone || '',
        email: row.agent_email,
      } : undefined,
    }));

    return properties;
  } catch (error) {
    console.error('❌ Chyba při načítání z Supabase:', error);
    throw error;
  }
}

/**
 * Vyhledá nemovitosti podle lokace
 */
export async function searchPropertiesByLocation(location: string): Promise<Property[]> {
  console.log(`🔍 Hledám nemovitosti v lokaci: ${location}`);
  
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .ilike('location', `%${location}%`)
    .in('status', ['active', 'new'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Transform same as above
  return data.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    area: row.area,
    pricePerM2: row.price_per_m2,
    location: row.location,
    type: row.type as PropertyType,
    disposition: row.disposition as PropertyDisposition,
    rating: row.rating as PropertyRating,
    discountPercentage: row.discount_percentage,
    imageUrl: row.image_url,
    source: row.source,
    sourceUrl: row.source_url,
    createdAt: new Date(row.created_at),
    isNew: row.status === 'new',
  }));
}

/**
 * Full-text search napříč titulky a popisy
 */
export async function searchPropertiesByText(query: string): Promise<Property[]> {
  console.log(`🔍 Full-text search: ${query}`);
  
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .textSearch('search_vector', query)
    .in('status', ['active', 'new'])
    .limit(50);

  if (error) throw error;
  
  return data.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    area: row.area,
    pricePerM2: row.price_per_m2,
    location: row.location,
    type: row.type as PropertyType,
    disposition: row.disposition as PropertyDisposition,
    rating: row.rating as PropertyRating,
    discountPercentage: row.discount_percentage,
    imageUrl: row.image_url,
    source: row.source,
    sourceUrl: row.source_url,
    createdAt: new Date(row.created_at),
    isNew: row.status === 'new',
  }));
}

/**
 * Načte statistiky nemovitostí
 */
export async function getPropertiesStats() {
  const { data, error } = await supabase
    .from('properties_stats')
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Real-time subscription na změny v properties tabulce
 */
export function subscribeToPropertyChanges(
  callback: (payload: any) => void
) {
  console.log('🔔 Subscribing to property changes...');
  
  const channel = supabase
    .channel('properties-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'properties'
      },
      (payload) => {
        console.log('🔔 Property changed:', payload);
        callback(payload);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    console.log('🔕 Unsubscribing from property changes');
    supabase.removeChannel(channel);
  };
}
