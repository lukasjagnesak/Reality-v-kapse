// Simulace celého parsovacího procesu

const headers = ['hash_id', 'url', 'titulek', 'lokalita', 'dispozice', 'plocha_m2', 'cena', 'cena_za_m2', 'patro', 'stav_objektu', 'image_url', 'telefon', 'vlozeno_at', 'upraveno_at', 'first_seen_at', 'last_seen_at', 'last_price', 'price_changed_at', 'status', 'hypo_mesic'];

const row = [
  '1666904908',
  'https://www.sreality.cz/detail/prodej/byt/1+kk/brno-zebetin-jerlinova/1666904908',
  'Prodej bytu 1+kk 71 m²',
  'Jerlínová, Brno - Žebětín',
  '1+kk',
  '71',
  '5 150 000 Kč',
  '72 535 Kč',
  '',
  '',
  'https://d18-a.sdn.cz/d_18/c_img_od_D/nPSV1TXV2nCruJ2CIwEbnDPa/76d8.jpeg?fl=res,400,300,3|shr,,20|jpg,90',
  '',
  '2025-10-08T06:48:16.618Z',
  '2025-10-08T06:48:41.479Z',
  '2025-10-08T06:48:16.618Z',
  '2025-10-08T06:48:41.479Z',
  '',
  '',
  'new',
  '17167'
];

// Scraper format detection
const isScraperFormat = headers[0]?.toLowerCase().includes("hash_id");
console.log("Je scraper formát?", isScraperFormat);

if (isScraperFormat) {
  const [
    hash_id,
    url,
    titulek,
    lokalita,
    dispozice,
    plocha_m2,
    cena,
    cena_za_m2,
  ] = row;

  console.log("\n📊 Parsovaná data:");
  console.log("  hash_id:", hash_id);
  console.log("  url:", url);
  console.log("  titulek:", titulek);
  console.log("  lokalita:", lokalita);
  console.log("  dispozice:", dispozice);
  console.log("  plocha_m2:", plocha_m2);
  console.log("  cena:", cena);
  console.log("  cena_za_m2:", cena_za_m2);

  // Validace
  console.log("\n✅ Validace:");
  console.log("  hash_id OK?", !!hash_id);
  console.log("  titulek OK?", !!titulek);
  console.log("  cena OK?", !!cena);
  console.log("  plocha_m2 OK?", !!plocha_m2);
  console.log("  lokalita OK?", !!lokalita);

  // Parsing čísel
  const price = parseFloat(cena.replace(/[^\d.-]/g, ""));
  const area = parseFloat(plocha_m2.replace(/[^\d.-]/g, ""));
  const pricePerM2 = parseFloat(cena_za_m2?.replace(/[^\d.-]/g, "") || "0") || Math.round(price / area);

  console.log("\n💰 Převedené hodnoty:");
  console.log("  price:", price);
  console.log("  area:", area);
  console.log("  pricePerM2:", pricePerM2);
  console.log("  Jsou čísla?", !isNaN(price) && !isNaN(area));

  // Vytvoření property objektu
  const property = {
    id: hash_id.trim(),
    title: titulek.trim(),
    price,
    area,
    pricePerM2,
    location: lokalita.trim(),
    type: "byt",
    disposition: dispozice,
    discountPercentage: 0,
  };

  console.log("\n🏠 Finální property objekt:");
  console.log(JSON.stringify(property, null, 2));
}
