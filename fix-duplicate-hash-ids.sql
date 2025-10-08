-- Fix: Některé nemovitosti mají stejný hash_id
-- Změníme hash_id constraint z UNIQUE na index pro rychlé vyhledávání

-- Krok 1: Smazat UNIQUE constraint z hash_id
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_hash_id_key;

-- Krok 2: Hash_id může být duplicitní (stejný byt může být vícekrát v DB s různou cenou)
-- Index už existuje, takže nemusíme nic dělat

-- Krok 3: Verifikace
SELECT 
  hash_id, 
  COUNT(*) as count,
  array_agg(id) as property_ids
FROM public.properties 
GROUP BY hash_id 
HAVING COUNT(*) > 1
ORDER BY count DESC
LIMIT 5;
