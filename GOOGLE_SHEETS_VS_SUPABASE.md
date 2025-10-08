# 🏠 Google Sheets vs Supabase pro databázi nemovitostí

## 📊 Srovnání řešení

### **Aktuální stav: Google Sheets**

#### ✅ **Výhody:**
- **Jednoduché naplnění dat** - scraper přímo zapisuje CSV
- **Vizuální správa** - můžete vidět a editovat data v tabulce
- **Sdílení** - můžete sdílet s kolegy/týmem
- **Žádné databázové znalosti** - stačí umět Excel/Sheets
- **Verzování** - historie změn v Google Sheets
- **Import/Export** - snadný export do CSV

#### ❌ **Nevýhody:**
- **Pomalé dotazování** - API volání může trvat 2-5 sekund
- **Rate limity** - omezený počet requestů za den
- **Žádné indexy** - nemůžete optimalizovat vyhledávání
- **Žádné relace** - těžko propojit s uživatelskými daty
- **Bez real-time updates** - musíte manuálně refreshovat
- **Bezpečnost** - komplikovanější řízení přístupu
- **Škálovatelnost** - problémy s větším množstvím dat (>10k řádků)

---

### **Budoucí řešení: Supabase Database**

#### ✅ **Výhody:**
- **Rychlé dotazy** - odpovědi v milisekundách
- **Pokročilé filtrování** - SQL WHERE, JOIN, GROUP BY
- **Indexy** - optimalizace vyhledávání
- **Real-time subscriptions** - automatické updaty když se data změní
- **Relace s uživateli** - propojení s user_favorites, user_alerts
- **Full-text search** - hledání v titulcích a popisech
- **Geografické dotazy** - PostGIS pro hledání podle vzdálenosti
- **Žádné rate limity** - prakticky neomezené dotazy
- **Row Level Security** - bezpečné sdílení dat
- **Automatické API** - REST + GraphQL endpointy zdarma
- **Škálovatelnost** - bez problémů zvládne miliony záznamů

#### ❌ **Nevýhody:**
- **Složitější naplnění** - scraper musí zapisovat do Postgres
- **SQL znalosti** - pro pokročilé operace
- **Méně vizuální** - admin přes Table Editor, ne spreadsheet
- **Náročnější správa** - musíte znát databázové koncepty

---

## 🎯 **Doporučení: ANO, přejít na Supabase!**

### **Proč?**

1. **Máte už Supabase setup** - databáze běží, credentials jsou nastavené
2. **Autentizace funguje** - users jsou v Supabase
3. **Výkon** - Google Sheets je bottleneck pro aplikaci
4. **Budoucnost** - s růstem dat bude Sheets nepraktický
5. **Features** - můžete přidat real-time notifikace, alerts, atd.

---

## 🚀 **Plán migrace: Google Sheets → Supabase**

### **Fáze 1: Vytvořit tabulku properties** ✅ (5 min)
```sql
CREATE TABLE properties (
  id TEXT PRIMARY KEY,
  hash_id TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  area NUMERIC NOT NULL,
  price_per_m2 INTEGER,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  disposition TEXT NOT NULL,
  rating TEXT,
  discount_percentage INTEGER DEFAULT 0,
  image_url TEXT,
  source TEXT DEFAULT 'sreality',
  source_url TEXT,
  status TEXT DEFAULT 'active',
  
  -- Price history
  last_price INTEGER,
  price_changed_at TIMESTAMPTZ,
  
  -- Agent info
  agent_name TEXT,
  agent_phone TEXT,
  
  -- Metadata
  floor TEXT,
  building_state TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Search optimization
  search_vector tsvector
);

-- Indexes pro rychlé vyhledávání
CREATE INDEX properties_location_idx ON properties(location);
CREATE INDEX properties_price_idx ON properties(price);
CREATE INDEX properties_area_idx ON properties(area);
CREATE INDEX properties_type_idx ON properties(type);
CREATE INDEX properties_disposition_idx ON properties(disposition);
CREATE INDEX properties_status_idx ON properties(status);
CREATE INDEX properties_search_vector_idx ON properties USING GIN(search_vector);

-- Full-text search trigger
CREATE FUNCTION properties_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('czech', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('czech', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('czech', COALESCE(NEW.location, '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_search_update 
  BEFORE INSERT OR UPDATE ON properties 
  FOR EACH ROW EXECUTE FUNCTION properties_search_trigger();

-- Auto-update timestamp
CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- RLS policies
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Všichni authenticated users můžou číst
CREATE POLICY "Anyone can view active properties" ON properties
  FOR SELECT USING (status = 'active');

-- Jen admin může zapisovat (později můžete změnit)
CREATE POLICY "Service role can manage properties" ON properties
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');
```

### **Fáze 2: Migrovat existující data** ✅ (10 min)
```javascript
// Jednorázový migration script
const migrateFromSheets = async () => {
  // 1. Načíst data z Google Sheets
  const properties = await fetchPropertiesFromGoogleSheets();
  
  // 2. Insertnout do Supabase
  const { data, error } = await supabase
    .from('properties')
    .insert(properties.map(p => ({
      id: p.id,
      hash_id: p.id.split('-')[0], // Remove index suffix
      title: p.title,
      description: p.description,
      price: p.price,
      area: p.area,
      price_per_m2: p.pricePerM2,
      location: p.location,
      type: p.type,
      disposition: p.disposition,
      rating: p.rating,
      discount_percentage: p.discountPercentage,
      image_url: p.imageUrl,
      source_url: p.sourceUrl,
      agent_name: p.agent?.name,
      agent_phone: p.agent?.phone,
      last_price: p.priceHistory?.oldPrice,
      price_changed_at: p.priceHistory?.changedAt,
      created_at: p.createdAt,
      status: p.isNew ? 'new' : 'active'
    })));
  
  console.log(`✅ Migrated ${data.length} properties`);
};
```

### **Fáze 3: Aktualizovat aplikaci** ✅ (15 min)
```typescript
// src/api/realtyService.ts (NOVÝ SOUBOR)
export async function fetchPropertiesFromSupabase(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

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
    priceHistory: row.last_price ? {
      oldPrice: row.last_price,
      newPrice: row.price,
      changedAt: new Date(row.price_changed_at),
    } : undefined,
    agent: row.agent_name ? {
      name: row.agent_name,
      phone: row.agent_phone,
    } : undefined,
  }));
}
```

### **Fáze 4: Aktualizovat scraper** ✅ (20 min)
```javascript
// scraper/sreality-scraper-supabase.js (NOVÝ)
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Service key pro zápis
);

async function saveToSupabase(properties) {
  for (const property of properties) {
    // Upsert - update pokud existuje, insert pokud ne
    const { error } = await supabase
      .from('properties')
      .upsert({
        hash_id: property.hash_id,
        title: property.title,
        price: property.price,
        // ... další data
        last_seen_at: new Date(),
      }, {
        onConflict: 'hash_id',
        ignoreDuplicates: false
      });
    
    if (error) console.error('Error saving property:', error);
  }
  
  console.log(`✅ Saved ${properties.length} properties to Supabase`);
}
```

---

## 💡 **Pokročilé funkce s Supabase**

### **1. Real-time notifikace**
```typescript
// Automaticky refresh při změně dat
supabase
  .channel('properties')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'properties'
  }, (payload) => {
    console.log('Nová nemovitost!', payload);
    // Refresh seznam
  })
  .subscribe();
```

### **2. Price alerts**
```typescript
// User si nastaví alert "notifikuj mě když cena klesne pod 5M"
// Trigger v databázi automaticky pošle notifikaci
```

### **3. Geografické vyhledávání**
```sql
-- PostGIS extension pro vzdálenost
SELECT * FROM properties
WHERE ST_DWithin(
  location_point,
  ST_MakePoint(14.4378, 50.0755), -- Praha
  5000 -- 5km radius
);
```

### **4. Full-text search**
```typescript
const { data } = await supabase
  .from('properties')
  .select()
  .textSearch('search_vector', 'moderní byt praha');
```

---

## ⚖️ **Hybridní přístup (doporučeno pro začátek)**

### **Fáze 1: Duální systém**
- ✅ Data v OBOU místech (Sheets + Supabase)
- ✅ Scraper zapisuje do obou
- ✅ Aplikace čte z Supabase (rychlejší)
- ✅ Sheets jako backup a pro manuální editaci

### **Fáze 2: Postupná migrace**
- ✅ Po 1-2 týdnech testování
- ✅ Vypnout Google Sheets sync
- ✅ Používat jen Supabase

---

## 🎯 **Moje doporučení:**

### **KRÁTKODOBĚ (teď):**
**Nechte Google Sheets** - funguje, data jsou tam, scraper běží
- Není to urgentní
- Sheets je jednodušší na správu
- 210 nemovitostí není problém

### **STŘEDNĚDOBĚ (za 1-2 měsíce):**
**Přejděte na Supabase** když:
- Máte víc než 500 nemovitostí
- Chcete real-time features
- Google Sheets začne být pomalý
- Chcete price alerts

### **JAK NA TO:**
1. Vytvořím vám kompletní migration script
2. Pustíte ho jednou - data se zkopírují
3. Aplikace se přepne na Supabase
4. ✅ Hotovo za ~30 minut

---

## 📈 **Výkonnostní srovnání:**

| Operace | Google Sheets | Supabase |
|---------|--------------|----------|
| Načíst všechny nemovitosti | ~3-5s | ~50-100ms |
| Filtrovat podle ceny | ~3-5s | ~10ms |
| Full-text search | ❌ | ~20ms |
| Real-time updates | ❌ | ✅ instant |
| Concurrent users | ~10 | ~1000+ |

---

## 🤔 **Závěr:**

**Odpověď: ANO, Supabase je lepší, ALE...**

- ✅ Google Sheets je OK pro prototyp a testování
- ✅ Supabase je nutný pro produkci a škálování
- ✅ Migrace je snadná (30-60 minut práce)
- ✅ Můžete to udělat kdykoli později

**Chcete migrovat TEĎ nebo později?**

Pokud chcete TEĎ:
1. Vytvořím SQL schema pro properties tabulku
2. Vytvořím migration script
3. Upravím aplikaci aby četla z Supabase
4. Aktualizujeme scraper

Pokud POZDĚJI:
- Nechte to jak je
- Aplikace funguje perfektně
- Migrujete až když bude potřeba

**Co si myslíte? Migrujeme teď nebo necháme Sheets?** 🤔
