-- Testovací data pro Reality v Kapse
-- Spusete tento SQL v Supabase SQL Editor JAKO SERVICE ROLE
-- Tím vlo~íte testovací nemovitosti do databáze

-- ============================================================================
-- TESTOVACÍ NEMOVITOSTI - Praha
-- ============================================================================

INSERT INTO public.properties (
  id, hash_id, title, description, price, area, price_per_m2,
  location, type, disposition, rating, discount_percentage,
  image_url, source, source_url, status
) VALUES
-- }i~kov - nejlepaí nabídky
(
  '1', 'test-zizkov-1',
  'Prostorný byt 2+kk v srdci }i~kova',
  'Krásný byt v klidné ásti }i~kova, kompletn zrekonstruovaný, nová kuchyH, balkon s výhledem.',
  4500000, 55, 81818,
  'Praha 3, }i~kov', 'byt', '2+kk', 'A+', 18,
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'sreality', 'https://sreality.cz',
  'active'
),
(
  '2', 'test-zizkov-2',
  'Moderní byt 2+kk s terasou - }i~kov',
  'Nov postavený byt s velkou terasou, parkování v cen, metro 5 minut paky.',
  5200000, 58, 89655,
  'Praha 3, }i~kov', 'byt', '2+kk', 'A', 12,
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'sreality', 'https://sreality.cz',
  'new'
),
(
  '3', 'test-zizkov-3',
  'Slunný byt 2+kk blízko parku',
  'Svtlý byt v panelovém dom, nízké náklady, skvlá obanská vybavenost.',
  3900000, 52, 75000,
  'Praha 3, }i~kov', 'byt', '2+kk', 'B', 8,
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'sreality', 'https://sreality.cz',
  'active'
),

-- Vinohrady - dra~aí lokalita
(
  '4', 'test-vinohrady-1',
  'Luxusní byt 2+kk ve Vinohradech',
  'Presti~ní byt v secesním dom, vysoké stropy, parkety, klimatizace.',
  6500000, 60, 108333,
  'Praha 2, Vinohrady', 'byt', '2+kk', 'A', 10,
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', 'sreality', 'https://sreality.cz',
  'active'
),
(
  '5', 'test-vinohrady-2',
  'Rekonstruovaný byt 2+kk s balkonem',
  'Kompletn zrekonstruovaný byt, vybavená kuchyH, klidná ulice.',
  5800000, 55, 105455,
  'Praha 2, Vinohrady', 'byt', '2+kk', 'B', 5,
  'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800', 'sreality', 'https://sreality.cz',
  'active'
),

-- Praha 3 - rozné dispozice
(
  '6', 'test-praha3-1',
  'Útulný garsonka 1+kk Praha 3',
  'Malý ale funkní byt, ideální pro jednu osobu nebo investici.',
  2800000, 28, 100000,
  'Praha 3', 'byt', '1+kk', 'B', 7,
  'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800', 'sreality', 'https://sreality.cz',
  'active'
),
(
  '7', 'test-praha3-2',
  'Prostorný byt 3+kk s lod~ií',
  'Velký rodinný byt, 2 koupelny, sklep, parkování.',
  7200000, 85, 84706,
  'Praha 3', 'byt', '3+kk', 'A', 15,
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', 'sreality', 'https://sreality.cz',
  'new'
),

-- Karlín
(
  '8', 'test-karlin-1',
  'Novostavba 2+kk Karlín',
  'Brand new apartment, moderní design, balkon, reception.',
  6800000, 62, 109677,
  'Praha 8, Karlín', 'byt', '2+kk', 'A+', 20,
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'sreality', 'https://sreality.cz',
  'new'
),

-- Dalaí lokality pro porovnání
(
  '9', 'test-smichov-1',
  'Byt 2+kk se zahradou - Smíchov',
  'PYízemní byt s vlastní zahradou 50m2, tiché prostYedí.',
  5500000, 58, 94828,
  'Praha 5, Smíchov', 'byt', '2+kk', 'A', 12,
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 'sreality', 'https://sreality.cz',
  'active'
),
(
  '10', 'test-holesovice-1',
  'Industriální loft 2+kk Holeaovice',
  'Unikátní prostorný loft s vysokými stropy, 2 patra.',
  7800000, 95, 82105,
  'Praha 7, Holeaovice', 'byt', '2+kk', 'A+', 18,
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 'sreality', 'https://sreality.cz',
  'active'
);

-- ============================================================================
-- TESTOVACÍ NEMOVITOSTI - Brno
-- ============================================================================

INSERT INTO public.properties (
  id, hash_id, title, description, price, area, price_per_m2,
  location, type, disposition, rating, discount_percentage,
  image_url, source, source_url, status
) VALUES
(
  '11', 'test-brno-stred-1',
  'Moderní byt 2+kk - Brno centrum',
  'Nový byt v centru Brna, klimatizace, terasa, parkování.',
  4200000, 58, 72414,
  'Brno, StYed', 'byt', '2+kk', 'A', 10,
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'sreality', 'https://sreality.cz',
  'active'
),
(
  '12', 'test-brno-stred-2',
  'Rekonstruovaný byt 2+kk centrum',
  'Kompletn zrekonstruovaný byt, historické centrum Brna.',
  3800000, 52, 73077,
  'Brno, StYed', 'byt', '2+kk', 'B', 8,
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'sreality', 'https://sreality.cz',
  'active'
),
(
  '13', 'test-brno-kohoutovice-1',
  'Prostorný byt 3+1 Kohoutovice',
  'Velký rodinný byt v klidné tvrti, blízko pYírody.',
  4500000, 75, 60000,
  'Brno, Kohoutovice', 'byt', '3+1', 'A+', 15,
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', 'sreality', 'https://sreality.cz',
  'new'
);

-- ============================================================================
-- TESTOVACÍ NEMOVITOSTI - Domy
-- ============================================================================

INSERT INTO public.properties (
  id, hash_id, title, description, price, area, price_per_m2,
  location, type, disposition, rating, discount_percentage,
  image_url, source, source_url, status
) VALUES
(
  '14', 'test-dum-praha-1',
  'Rodinný dom 5+kk Praha západ',
  'Krásný rodinný dom s bazénem, gará~ pro 2 auta, zahrada 800m2.',
  12500000, 180, 69444,
  'Praha-západ, ernoaice', 'dom', '5+kk', 'A+', 20,
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800', 'sreality', 'https://sreality.cz',
  'new'
),
(
  '15', 'test-dum-brno-1',
  'Moderní dom 4+kk Brno okolí',
  'Nový dom s velkou zahradou, energeticky úsporný.',
  8900000, 150, 59333,
  'Brno-venkov, `lapanice', 'dom', '4+kk', 'A', 12,
  'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800', 'sreality', 'https://sreality.cz',
  'active'
);

-- ============================================================================
-- STATISTICS
-- ============================================================================

SELECT
  'Testovací data úspan vlo~ena!' as message,
  COUNT(*) as total_properties,
  COUNT(*) FILTER (WHERE type = 'byt') as byty,
  COUNT(*) FILTER (WHERE type = 'dom') as domy,
  COUNT(*) FILTER (WHERE status = 'new') as nove,
  COUNT(*) FILTER (WHERE status = 'active') as aktivni,
  COUNT(*) FILTER (WHERE location LIKE 'Praha%') as praha,
  COUNT(*) FILTER (WHERE location LIKE 'Brno%') as brno
FROM public.properties
WHERE id IN ('1','2','3','4','5','6','7','8','9','10','11','12','13','14','15');

-- ============================================================================
--  HOTOVO! Nyní máte 15 testovacích nemovitostí v databázi
-- ============================================================================
