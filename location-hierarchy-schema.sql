-- Location Hierarchy & Average Prices Schema
-- Rozšíření properties tabulky o hierarchii lokality a průměrné ceny

-- ============================================================================
-- KROK 1: Přidat sloupce pro hierarchii lokality
-- ============================================================================

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS location_street TEXT,
ADD COLUMN IF NOT EXISTS location_city TEXT,
ADD COLUMN IF NOT EXISTS location_district TEXT,
ADD COLUMN IF NOT EXISTS location_region TEXT;

-- Index pro rychlé vyhledávání
CREATE INDEX IF NOT EXISTS properties_location_city_idx ON public.properties(location_city);
CREATE INDEX IF NOT EXISTS properties_location_district_idx ON public.properties(location_district);

-- ============================================================================
-- KROK 2: Parsovat existující lokality do hierarchie
-- ============================================================================

-- Funkce pro parsování lokality ve formátu:
-- "Ulice, Město - Část" → street: Ulice, city: Město, district: Část
-- "Město - Část, okres Okres" → city: Město, district: Část, region: Okres

CREATE OR REPLACE FUNCTION parse_location_hierarchy()
RETURNS void AS $$
DECLARE
  prop RECORD;
  loc TEXT;
  parts TEXT[];
  city_district TEXT[];
BEGIN
  FOR prop IN SELECT id, location FROM public.properties LOOP
    loc := prop.location;
    
    -- Formát 1: "Ulice, Město - Část"
    IF loc ~ '.*,.*-.*' THEN
      parts := string_to_array(loc, ',');
      
      IF array_length(parts, 1) >= 2 THEN
        -- Street je první část
        UPDATE public.properties 
        SET location_street = trim(parts[1])
        WHERE id = prop.id;
        
        -- Město a Část jsou za čárkou
        city_district := string_to_array(trim(parts[2]), '-');
        IF array_length(city_district, 1) >= 2 THEN
          UPDATE public.properties 
          SET 
            location_city = trim(city_district[1]),
            location_district = trim(city_district[2])
          WHERE id = prop.id;
        END IF;
      END IF;
      
    -- Formát 2: "Město - Část, okres Okres"
    ELSIF loc ~ '.*-.*,.*okres.*' THEN
      parts := string_to_array(loc, ',');
      
      IF array_length(parts, 1) >= 2 THEN
        -- Město a Část jsou první část
        city_district := string_to_array(trim(parts[1]), '-');
        IF array_length(city_district, 1) >= 2 THEN
          UPDATE public.properties 
          SET 
            location_city = trim(city_district[1]),
            location_district = trim(city_district[2])
          WHERE id = prop.id;
        END IF;
        
        -- Okres je druhá část
        UPDATE public.properties 
        SET location_region = trim(replace(parts[2], 'okres ', ''))
        WHERE id = prop.id;
      END IF;
    END IF;
    
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Spustit parsování
SELECT parse_location_hierarchy();

-- ============================================================================
-- KROK 3: VIEW pro průměrné ceny podle lokality + dispozice
-- ============================================================================

-- View: Průměrné ceny podle MĚSTO + DISPOZICE
CREATE OR REPLACE VIEW public.avg_prices_city_disposition AS
SELECT 
  location_city,
  disposition,
  COUNT(*) as property_count,
  ROUND(AVG(price_per_m2)) as avg_price_per_m2,
  ROUND(AVG(price)) as avg_price,
  MIN(price_per_m2) as min_price_per_m2,
  MAX(price_per_m2) as max_price_per_m2
FROM public.properties
WHERE 
  location_city IS NOT NULL 
  AND price_per_m2 > 0
  AND status IN ('active', 'new')
GROUP BY location_city, disposition
HAVING COUNT(*) >= 3; -- Minimálně 3 nemovitosti pro statistickou relevanci

-- View: Průměrné ceny podle MĚSTO + ČÁST + DISPOZICE (nejvíce detailní)
CREATE OR REPLACE VIEW public.avg_prices_district_disposition AS
SELECT 
  location_city,
  location_district,
  disposition,
  COUNT(*) as property_count,
  ROUND(AVG(price_per_m2)) as avg_price_per_m2,
  ROUND(AVG(price)) as avg_price,
  MIN(price_per_m2) as min_price_per_m2,
  MAX(price_per_m2) as max_price_per_m2
FROM public.properties
WHERE 
  location_city IS NOT NULL 
  AND location_district IS NOT NULL
  AND price_per_m2 > 0
  AND status IN ('active', 'new')
GROUP BY location_city, location_district, disposition
HAVING COUNT(*) >= 2; -- Minimálně 2 nemovitosti

-- View: Průměrné ceny pouze podle MĚSTO (fallback pro málo dat)
CREATE OR REPLACE VIEW public.avg_prices_city AS
SELECT 
  location_city,
  COUNT(*) as property_count,
  ROUND(AVG(price_per_m2)) as avg_price_per_m2,
  ROUND(AVG(price)) as avg_price,
  MIN(price_per_m2) as min_price_per_m2,
  MAX(price_per_m2) as max_price_per_m2
FROM public.properties
WHERE 
  location_city IS NOT NULL 
  AND price_per_m2 > 0
  AND status IN ('active', 'new')
GROUP BY location_city
HAVING COUNT(*) >= 3;

-- ============================================================================
-- KROK 4: Funkce pro získání průměrné ceny s fallback hierarchií
-- ============================================================================

CREATE OR REPLACE FUNCTION get_avg_price_for_location(
  p_city TEXT,
  p_district TEXT,
  p_disposition TEXT
) RETURNS TABLE(
  avg_price_per_m2 INTEGER,
  property_count INTEGER,
  level TEXT
) AS $$
BEGIN
  -- Level 1: Město + Část + Dispozice (nejvíce specifické)
  RETURN QUERY
  SELECT 
    avg.avg_price_per_m2::INTEGER,
    avg.property_count::INTEGER,
    'district_disposition'::TEXT
  FROM public.avg_prices_district_disposition avg
  WHERE 
    avg.location_city = p_city
    AND avg.location_district = p_district
    AND avg.disposition = p_disposition
  LIMIT 1;
  
  IF FOUND THEN RETURN; END IF;
  
  -- Level 2: Město + Dispozice (méně specifické)
  RETURN QUERY
  SELECT 
    avg.avg_price_per_m2::INTEGER,
    avg.property_count::INTEGER,
    'city_disposition'::TEXT
  FROM public.avg_prices_city_disposition avg
  WHERE 
    avg.location_city = p_city
    AND avg.disposition = p_disposition
  LIMIT 1;
  
  IF FOUND THEN RETURN; END IF;
  
  -- Level 3: Pouze Město (fallback)
  RETURN QUERY
  SELECT 
    avg.avg_price_per_m2::INTEGER,
    avg.property_count::INTEGER,
    'city_only'::TEXT
  FROM public.avg_prices_city avg
  WHERE avg.location_city = p_city
  LIMIT 1;
  
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- KROK 5: Aktualizovat discount_percentage podle lokálních průměrů
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_location_discount()
RETURNS void AS $$
DECLARE
  prop RECORD;
  avg_result RECORD;
  discount INTEGER;
BEGIN
  FOR prop IN 
    SELECT id, location_city, location_district, disposition, price_per_m2 
    FROM public.properties 
    WHERE location_city IS NOT NULL AND price_per_m2 > 0
  LOOP
    -- Získat průměrnou cenu pro tuto lokalitu
    SELECT * INTO avg_result
    FROM get_avg_price_for_location(
      prop.location_city, 
      prop.location_district, 
      prop.disposition
    )
    LIMIT 1;
    
    IF avg_result IS NOT NULL AND avg_result.avg_price_per_m2 > 0 THEN
      -- Vypočítat slevu oproti průměru
      discount := ROUND(((avg_result.avg_price_per_m2 - prop.price_per_m2)::NUMERIC / avg_result.avg_price_per_m2) * 100);
      
      -- Aktualizovat pouze pokud je sleva větší než současná
      UPDATE public.properties
      SET discount_percentage = GREATEST(discount, discount_percentage)
      WHERE id = prop.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Spustit výpočet slev
SELECT calculate_location_discount();

-- ============================================================================
-- KROK 6: View pro lokality (pro našeptávač)
-- ============================================================================

-- View: Všechny unikátní města
CREATE OR REPLACE VIEW public.unique_cities AS
SELECT DISTINCT 
  location_city as city,
  COUNT(*) as property_count
FROM public.properties
WHERE location_city IS NOT NULL
GROUP BY location_city
ORDER BY property_count DESC;

-- View: Všechny unikátní části města
CREATE OR REPLACE VIEW public.unique_districts AS
SELECT DISTINCT 
  location_city as city,
  location_district as district,
  COUNT(*) as property_count
FROM public.properties
WHERE location_city IS NOT NULL AND location_district IS NOT NULL
GROUP BY location_city, location_district
ORDER BY location_city, property_count DESC;

-- View: Všechny unikátní ulice
CREATE OR REPLACE VIEW public.unique_streets AS
SELECT DISTINCT 
  location_city as city,
  location_district as district,
  location_street as street,
  COUNT(*) as property_count
FROM public.properties
WHERE location_street IS NOT NULL
GROUP BY location_city, location_district, location_street
ORDER BY location_city, location_district, property_count DESC;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON public.avg_prices_city_disposition TO authenticated;
GRANT SELECT ON public.avg_prices_district_disposition TO authenticated;
GRANT SELECT ON public.avg_prices_city TO authenticated;
GRANT SELECT ON public.unique_cities TO authenticated;
GRANT SELECT ON public.unique_districts TO authenticated;
GRANT SELECT ON public.unique_streets TO authenticated;

-- ============================================================================
-- HOTOVO! Verifikace
-- ============================================================================

-- Test: Zobrazit 5 měst s nejvíce nemovitostmi
SELECT * FROM public.unique_cities LIMIT 5;

-- Test: Průměrné ceny v Brně pro 2+kk
SELECT * FROM public.avg_prices_city_disposition 
WHERE location_city = 'Brno' AND disposition = '2+kk';

-- Test: Získat průměrnou cenu pro konkrétní lokalitu
SELECT * FROM get_avg_price_for_location('Brno', 'Židenice', '2+kk');
