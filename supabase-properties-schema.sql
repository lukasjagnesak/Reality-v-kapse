-- Reality v Kapse - Properties Table Schema
-- Spusťte tento SQL v Supabase SQL Editor HNED PO user tabulkách

-- ============================================================================
-- TABULKA: properties
-- Uchovává všechny nemovitosti ze Sreality.cz
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.properties (
  -- Primary identifiers
  id TEXT PRIMARY KEY,
  hash_id TEXT UNIQUE NOT NULL, -- Sreality hash ID
  
  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  
  -- Pricing
  price INTEGER NOT NULL,
  area NUMERIC NOT NULL,
  price_per_m2 INTEGER,
  
  -- Location & categorization
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('byt', 'dům', 'pozemek', 'komerční')),
  disposition TEXT NOT NULL,
  
  -- Quality metrics
  rating TEXT CHECK (rating IN ('A+', 'A', 'B', 'C')),
  discount_percentage INTEGER DEFAULT 0,
  
  -- Media
  image_url TEXT,
  source TEXT DEFAULT 'sreality',
  source_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'new', 'sold', 'archived')),
  
  -- Price history
  last_price INTEGER,
  price_changed_at TIMESTAMPTZ,
  
  -- Agent info
  agent_name TEXT,
  agent_phone TEXT,
  agent_email TEXT,
  
  -- Additional details
  floor TEXT,
  building_state TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Full-text search
  search_vector tsvector
);

-- ============================================================================
-- INDEXES pro rychlé vyhledávání
-- ============================================================================

CREATE INDEX IF NOT EXISTS properties_hash_id_idx ON public.properties(hash_id);
CREATE INDEX IF NOT EXISTS properties_location_idx ON public.properties(location);
CREATE INDEX IF NOT EXISTS properties_price_idx ON public.properties(price);
CREATE INDEX IF NOT EXISTS properties_area_idx ON public.properties(area);
CREATE INDEX IF NOT EXISTS properties_type_idx ON public.properties(type);
CREATE INDEX IF NOT EXISTS properties_disposition_idx ON public.properties(disposition);
CREATE INDEX IF NOT EXISTS properties_status_idx ON public.properties(status);
CREATE INDEX IF NOT EXISTS properties_created_at_idx ON public.properties(created_at DESC);
CREATE INDEX IF NOT EXISTS properties_discount_idx ON public.properties(discount_percentage DESC);
CREATE INDEX IF NOT EXISTS properties_search_vector_idx ON public.properties USING GIN(search_vector);

-- ============================================================================
-- FULL-TEXT SEARCH trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION public.properties_search_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.location, '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS properties_search_update ON public.properties;
CREATE TRIGGER properties_search_update 
  BEFORE INSERT OR UPDATE ON public.properties 
  FOR EACH ROW EXECUTE FUNCTION public.properties_search_trigger();

-- ============================================================================
-- AUTO-UPDATE timestamp trigger
-- ============================================================================

DROP TRIGGER IF EXISTS properties_updated_at ON public.properties;
CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Všichni authenticated users můžou číst aktivní nemovitosti
CREATE POLICY "Anyone can view active properties" ON public.properties
  FOR SELECT USING (status IN ('active', 'new'));

-- Jen service role může zapisovat (pro scraper)
CREATE POLICY "Service role can manage properties" ON public.properties
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;

-- ============================================================================
-- VIEW: properties_with_stats (užitečné statistiky)
-- ============================================================================

CREATE OR REPLACE VIEW public.properties_stats AS
SELECT 
  COUNT(*) as total_properties,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'new') as new_count,
  COUNT(*) FILTER (WHERE status = 'sold') as sold_count,
  AVG(price) as avg_price,
  AVG(price_per_m2) as avg_price_per_m2,
  MIN(price) as min_price,
  MAX(price) as max_price,
  COUNT(DISTINCT location) as unique_locations,
  COUNT(DISTINCT type) as property_types
FROM public.properties;

GRANT SELECT ON public.properties_stats TO authenticated;

-- ============================================================================
-- FUNKCE: mark_properties_as_old
-- Označí nemovitosti, které nebyly viděny >7 dní jako archived
-- ============================================================================

CREATE OR REPLACE FUNCTION public.mark_old_properties_as_archived()
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  UPDATE public.properties
  SET status = 'archived'
  WHERE status IN ('active', 'new')
    AND last_seen_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ✅ HOTOVO!
-- Nyní máte kompletní properties tabulku
-- ============================================================================

-- Quick verification
SELECT 
  'Properties table created successfully!' as message,
  COUNT(*) as current_count
FROM public.properties;
