# > Sreality Scraper - Automatické naítání nemovitostí

**Automaticky stahuje reálná data ze Sreality.cz pYímo do Supabase databáze**

---

## <¯ Co to dlá

Scraper automaticky:
-  Stahuje nemovitosti ze Sreality.cz API
-  Ukládá je pYímo do Supabase databáze
-  Aktualizuje existující nemovitosti
-  Archivuje staré nabídky (staraí 7 dní)
-  Parsuje lokace (msto, okres, microlocalita)
-  Poítá cenu za m²

---

## =Ë Po~adavky

### 1. Supabase databáze musí být pYipravena

Ujistte se, ~e jste spustili SQL skripty:
- `supabase-schema.sql`
- `supabase-properties-schema.sql`

### 2. Environment promnné

V `.env` souboru musíte mít:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xhjkjcrjfwhrzjackboa.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

  **DnLE}ITÉ**: PotYebujete `SUPABASE_SERVICE_KEY` (ne anon key), proto~e scraper potYebuje práva na zápis do databáze!

---

## =€ Spuatní

### Jednorázové spuatní

```bash
# Pou~ijte npm
npm run scrape

# Nebo pYímo
node scraper/sreality-to-supabase.js

# Nebo bun
bun run scrape
```

### Co se stane:

1.  PYipojí se k Supabase
2.  Nate 5 stránek ze Sreality.cz (= ~100 nemovitostí)
3.  Pro ka~dou nemovitost:
   - VytvoYí nebo aktualizuje záznam v databázi
   - Parsuje dispozici, lokaci, cenu
   - PYidá obrázek
   - Nastaví status `active`
4.  Archivuje staré nemovitosti

### Výstup:

```
=€ Spouatím Sreality scraper...

 Supabase klient inicializován
=á Naítám stránku 1 z Sreality.cz...
=Ä Stránka 1: Nalezeno 20 nemovitostí
 1/1  2/2  3/3  4/4 ...

=Ê STATISTIKY:
   Celkem zpracováno: 100
   Úspan ulo~eno:   98
   Chyby:             2

=Ä  Archivuji staré nemovitosti...
 Archivováno 5 starých nemovitostí
 Hotovo!
```

---

## ™ Konfigurace

Upravte `CONFIG` v souboru `scraper/sreality-to-supabase.js`:

```javascript
const CONFIG = {
  // Poet stránek k prohledání (1 stránka = 20 nemovitostí)
  PAGES_TO_SCRAPE: 5, // 5 = 100 nemovitostí

  // Filtraní parametry
  SEARCH_PARAMS: {
    category_main_cb: 1,    // 1=byty, 2=domy, 3=pozemky, 4=komerní
    category_type_cb: 1,     // 1=prodej, 2=pronájem
    locality_region_id: 10,  // 10=Praha, 14=Brno
    per_page: 20,            // Poet na stránku
  },
};
```

### PYíklady konfigurace:

**Naíst domy v Brn:**
```javascript
SEARCH_PARAMS: {
  category_main_cb: 2,     // domy
  category_type_cb: 1,     // prodej
  locality_region_id: 14,  // Brno
  per_page: 20,
}
```

**Naíst pronájmy byto v Praze:**
```javascript
SEARCH_PARAMS: {
  category_main_cb: 1,     // byty
  category_type_cb: 2,     // pronájem
  locality_region_id: 10,  // Praha
  per_page: 20,
}
```

---

## = Automatické spouatní

### Mo~nost 1: Cron Job (Linux/Mac)

Spouatt ka~dých 10 minut:

```bash
# OtevYete crontab
crontab -e

# PYidejte Yádek:
*/10 * * * * cd /home/user/workspace && node scraper/sreality-to-supabase.js >> scraper.log 2>&1
```

### Mo~nost 2: GitHub Actions (doporueno)

VytvoYte `.github/workflows/scraper.yml`:

```yaml
name: Sreality Scraper

on:
  schedule:
    - cron: '*/10 * * * *'  # Ka~dých 10 minut
  workflow_dispatch:  # Manuální spuatní

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run scrape
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

### Mo~nost 3: Vercel Cron (pro deployment)

VytvoYte `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/scrape",
    "schedule": "0 */1 * * *"
  }]
}
```

---

## =Ê OvYení dat v Supabase

Po spuatní scraperu:

1. Jdte do Supabase Dashboard
2. OtevYete **Table Editor** > **properties**
3.  Mli byste vidt nové nemovitosti se statusem `active`
4.  Zkontrolujte `source` = `sreality`
5.  `last_seen_at` by mlo být aktuální

---

## = Xeaení problémo

### Problém: "Chybí Supabase konfigurace"

**Xeaení:**
- Zkontrolujte `.env` soubor
- Ujistte se, ~e máte `SUPABASE_SERVICE_KEY` (ne anon key)
- Service key najdete v Supabase > Settings > API > service_role key

### Problém: "Chyba pYi ukládání"

**Xeaení:**
- Zkontrolujte, ~e jste spustili SQL skripty
- Zkontrolujte RLS policies v Supabase
- Service role by mla mít plný pYístup

### Problém: "}ádná data z Sreality"

**Xeaení:**
- Sreality.cz API mo~e být doasn nedostupné
- Zkuste zmnit `locality_region_id` na jinou lokalitu
- Zkontrolujte internet pYipojení

---

## =È RozaíYení

### PYidat více lokalit

Mo~ete spouatt scraper vícekrát s roznými parametry:

```bash
# Praha
node scraper/sreality-to-supabase.js

# ZmHte CONFIG na Brno a spusete znovu
# nebo vytvoYte více konfigurací
```

### PYidat AI analýzu

V budoucnu mo~ete pYidat AI pro:
- Automatické hodnocení kvality (rating A+, A, B, C)
- Detekci slev (porovnání s historickými cenami)
- Extrakci více detailo z popiso

---

##  Checklist

- [ ] Spustit SQL skripty v Supabase
- [ ] PYidat `SUPABASE_SERVICE_KEY` do `.env`
- [ ] Spustit `npm run scrape`
- [ ] OvYit data v Supabase
- [ ] Zkontrolovat aplikaci - mly by se zobrazit nové nemovitosti
- [ ] (Volitelné) Nastavit automatické spouatní

---

## <‰ Hotovo!

Nyní máte **pln funkní systém** který automaticky naítá reálná data ze Sreality.cz!

**Dalaí kroky:**
- Nastavte automatické spouatní (cron/GitHub Actions)
- PYidejte více lokalit
- Sledujte logy a optimalizujte
