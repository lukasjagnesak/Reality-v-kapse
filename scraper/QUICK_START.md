# 🚀 Sreality.cz Scraper - Quick Start

## ⚡ 5 minut k automatickému scrapování

### 1️⃣ Instalace (30 sekund)

```bash
cd scraper
npm install
```

### 2️⃣ Google Service Account (2 minuty)

1. **[Google Cloud Console](https://console.cloud.google.com/)** → Nový projekt
2. **APIs & Services** → Library → Zapnout **"Google Sheets API"**
3. **Credentials** → Create Service Account → Stáhnout JSON
4. **Přejmenovat** stažený soubor na `service-account.json`
5. **Přesunout** do složky `scraper/`

### 3️⃣ Sdílet Google Sheets (30 sekund)

1. Otevřete váš [Google Sheets](https://docs.google.com/spreadsheets/d/12ZhQXFF_h-xyCB-nByNyE_mMBJ3M1BcgqQ2QshVk4Ck/edit)
2. **Sdílet** → Zadejte email z `service-account.json` (např. `scraper@project.iam.gserviceaccount.com`)
3. Práva: **Editor**

### 4️⃣ Konfigurace (30 sekund)

Ujistěte se, že máte v `.env`:

```bash
EXPO_PUBLIC_GOOGLE_SHEETS_ID=12ZhQXFF_h-xyCB-nByNyE_mMBJ3M1BcgqQ2QshVk4Ck
```

### 5️⃣ Spuštění! (10 sekund)

```bash
npm run scrape
```

**To je všechno!** 🎉

---

## 📊 Co se stane:

1. ✅ Otevře se headless Chrome
2. ✅ Načte prvních 10 stránek Sreality.cz (200 inzerátů)
3. ✅ Extrahuje ceny, plochy, lokace, obrázky
4. ✅ Nahraje do vašeho Google Sheets
5. ✅ Vypíše statistiky

**Výsledek:** Data v Google Sheets → Aplikace je automaticky zobrazí!

---

## 🔄 Automatické spouštění každých 10 minut

### Linux/Mac (Cron):

```bash
crontab -e
```

Přidejte:
```
*/10 * * * * cd /path/to/reality-v-kapse && node scraper/sreality-scraper-puppeteer.js >> scraper/scraper.log 2>&1
```

### GitHub Actions (Cloud - ZDARMA):

Vytvořte `.github/workflows/scraper.yml`:

```yaml
name: Scraper
on:
  schedule:
    - cron: '*/10 * * * *'

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd scraper && npm install && npm run scrape
        env:
          EXPO_PUBLIC_GOOGLE_SHEETS_ID: ${{ secrets.GOOGLE_SHEETS_ID }}
          GOOGLE_SERVICE_ACCOUNT_JSON: ${{ secrets.SERVICE_ACCOUNT }}
```

Nastavte **GitHub Secrets**:
- `GOOGLE_SHEETS_ID`
- `SERVICE_ACCOUNT` (celý JSON)

---

## 🎨 Upravit filtrační parametry

V `sreality-scraper-puppeteer.js` (řádek ~17):

```javascript
FILTERS: {
  transactionType: 'prodej',  // prodej | pronajem
  propertyType: 'byty',       // byty | domy | pozemky
  locations: [
    'praha-2', 
    'praha-3', 
    // ... přidejte vaše oblasti
  ],
  disposition: '1+kk',        // 1+kk, 2+kk, atd.
  ownership: 'osobni',        // osobni | druzstevni
},
```

---

## ❓ Problémy?

### "Cannot authenticate"
→ Zkontrolujte, že je Google Sheets sdílený s emailem service accountu

### "No listings found"
→ Nastavte `HEADLESS: false` pro viditelný prohlížeč a sledujte, co se děje

### "Puppeteer error"
→ Nainstalujte Chrome dependencies:
```bash
sudo apt-get install chromium-browser
```

---

## 📖 Podrobná dokumentace

→ [scraper/README.md](./README.md)

---

**Hotovo!** Nyní máte plně automatický scraper! 🎉

**Kontrola:**
```bash
# Zkontrolovat logy
cat scraper/scraper.log

# Ručně spustit
npm run scrape

# Viditelný prohlížeč (debugging)
# V souboru nastavte HEADLESS: false
```
