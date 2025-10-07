# Sreality.cz Scraper - Návod k použití

## 📋 Přehled

Automatický scraper pro stahování inzerátů z Sreality.cz a nahrávání do Google Sheets.

## 🎯 Co scraper dělá

✅ Prohledá prvních 10 stránek Sreality.cz (200 inzerátů)  
✅ Extrahuje všechny důležité údaje (cena, plocha, lokace, atd.)  
✅ Nahraje data do vašeho Google Sheets  
✅ Detekuje nové inzeráty  
✅ Detekuje změny cen  
✅ Lze nastavit jako cron job (každých 10 minut)  

## 🚀 Rychlý start

### 1. Instalace

```bash
cd scraper
npm install
```

**Závislosti:**
- `puppeteer` - Pro automatizaci prohlížeče
- `googleapis` - Pro Google Sheets API
- `dotenv` - Pro environment proměnné

### 2. Nastavení Google Sheets API

#### A) Vytvoření Service Account

1. **Jděte na [Google Cloud Console](https://console.cloud.google.com/)**

2. **Vytvořte nový projekt nebo vyberte existující**

3. **Zapněte Google Sheets API:**
   - APIs & Services > Library
   - Vyhledejte "Google Sheets API"
   - Klikněte "Enable"

4. **Vytvořte Service Account:**
   - APIs & Services > Credentials
   - Create Credentials > Service Account
   - Vyplňte název (např. "reality-v-kapse-scraper")
   - Klikněte "Create and Continue"
   - Role: "Editor" nebo "Service Account User"
   - Klikněte "Done"

5. **Stáhněte JSON klíč:**
   - Klikněte na vytvořený Service Account
   - Keys > Add Key > Create new key
   - Vyberte JSON
   - Stáhne se soubor `project-name-xxxxx.json`

6. **Přesuňte klíč:**
   ```bash
   mv ~/Downloads/project-name-xxxxx.json ./scraper/service-account.json
   ```

#### B) Sdílení Google Sheets

1. Otevřete váš Google Sheets
2. Klikněte "Sdílet" (Share)
3. Do pole zadejte **email z service account** (např. `scraper@project-name.iam.gserviceaccount.com`)
4. Nastavte práva na **"Editor"**
5. Klikněte "Sdílet"

### 3. Konfigurace

Vytvořte `.env` soubor v kořenové složce (pokud ještě neexistuje):

```bash
# .env
EXPO_PUBLIC_GOOGLE_SHEETS_ID=12ZhQXFF_h-xyCB-nByNyE_mMBJ3M1BcgqQ2QshVk4Ck
GOOGLE_SERVICE_ACCOUNT_PATH=./scraper/service-account.json
```

### 4. Spuštění

```bash
# Jednorázové spuštění
npm run scrape

# Nebo přímo
node sreality-scraper-puppeteer.js
```

## ⚙️ Konfigurace filtrů

Upravte soubor `sreality-scraper-puppeteer.js`:

```javascript
const CONFIG = {
  PAGES_TO_SCRAPE: 10, // Počet stránek (1 stránka = 20 inzerátů)
  
  FILTERS: {
    transactionType: 'prodej', // prodej | pronajem
    propertyType: 'byty',      // byty | domy | pozemky | komercni
    locations: [
      'praha-2', 
      'praha-3', 
      'praha-4', 
      // ... přidejte další lokality
    ],
    disposition: '1+kk',       // 1+kk, 2+kk, 3+kk, atd.
    ownership: 'osobni',       // osobni | druzstevni | statu-obce
  },
};
```

## 🔄 Automatické spouštění (Cron)

### Linux/Mac:

```bash
# Otevřít crontab
crontab -e

# Přidat řádek (spustit každých 10 minut)
*/10 * * * * cd /path/to/reality-v-kapse && node scraper/sreality-scraper-puppeteer.js >> scraper/scraper.log 2>&1
```

### Windows (Task Scheduler):

1. Otevřete Task Scheduler
2. Create Basic Task
3. Trigger: "Recurring" - každých 10 minut
4. Action: "Start a program"
   - Program: `node`
   - Arguments: `scraper/sreality-scraper-puppeteer.js`
   - Start in: `C:\path\to\reality-v-kapse`

### GitHub Actions (Cloud - ZDARMA):

Vytvořte `.github/workflows/scraper.yml`:

```yaml
name: Sreality Scraper

on:
  schedule:
    - cron: '*/10 * * * *'  # Každých 10 minut
  workflow_dispatch:        # Manuální spuštění

jobs:
  scrape:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd scraper
          npm install
      
      - name: Run scraper
        env:
          EXPO_PUBLIC_GOOGLE_SHEETS_ID: ${{ secrets.GOOGLE_SHEETS_ID }}
          GOOGLE_SERVICE_ACCOUNT_JSON: ${{ secrets.GOOGLE_SERVICE_ACCOUNT }}
        run: |
          echo "$GOOGLE_SERVICE_ACCOUNT_JSON" > scraper/service-account.json
          node scraper/sreality-scraper-puppeteer.js
```

Nastavte GitHub Secrets:
- `GOOGLE_SHEETS_ID`
- `GOOGLE_SERVICE_ACCOUNT` (celý obsah JSON souboru)

## 📊 Výstup do Google Sheets

Scraper vytvoří/aktualizuje list "Inzeráty" s těmito sloupci:

| Sloupec | Popis |
|---------|-------|
| A: ID | Unikátní ID inzerátu |
| B: Název | Název nemovitosti |
| C: Popis | Popis (pokud dostupný) |
| D: Cena | Cena v Kč |
| E: Plocha | Plocha v m² |
| F: Lokalita | Lokalita (např. "Praha 3, Žižkov") |
| G: Typ | byt / dům / pozemek |
| H: Dispozice | 1+kk, 2+kk, atd. |
| I: Sleva v % | 0 (bude dopočítáno aplikací) |
| J: URL obrázku | Odkaz na obrázek |
| K: URL inzerátu | Odkaz na Sreality.cz |
| L-O: Kontakt | Makléř (pokud dostupný) |

## 🔍 Detekce změn

Scraper automaticky detekuje:

### 🆕 Nové inzeráty
- Porovná ID s předchozím během
- Vypíše nově přidané inzeráty

### 💰 Změny cen
- Porovná ceny stejných ID
- Vypíše rozdíl v Kč a %

### 🗑️ Odebrané inzeráty
- Zjistí, které inzeráty zmizely

## 🎨 Aktualizace selektorů

Sreality.cz může změnit strukturu HTML. Pokud scraper nefunguje:

1. **Otevřete Sreality.cz v prohlížeči**
2. **Pravé tlačítko > Prozkoumat prvek (Inspect)**
3. **Najděte správné CSS selektory**
4. **Upravte v souboru `sreality-scraper-puppeteer.js`:**

```javascript
// Řádek ~135 - upravte selektory podle skutečné struktury
const titleElem = elem.querySelector('.name, .title, h2');
const priceElem = elem.querySelector('.price, .norm-price');
const locationElem = elem.querySelector('.locality, .location');
```

## 🐛 Řešení problémů

### "Cannot find module 'puppeteer'"
```bash
cd scraper
npm install
```

### "Authentication failed"
- Zkontrolujte cestu k `service-account.json`
- Ověřte, že je Google Sheets sdílený s emailem service accountu
- Zkontrolujte oprávnění (Editor)

### "No listings found"
- Zkontrolujte URL v konzoli
- Otevřete URL v prohlížeči
- Upravte filtrační parametry
- Zkuste nastavit `HEADLESS: false` pro viditelný prohlížeč

### Puppeteer se nespustí na serveru
```bash
# Install dependencies na Linuxu
sudo apt-get update
sudo apt-get install -y \
  chromium-browser \
  libatk-bridge2.0-0 \
  libatspi2.0-0 \
  libcups2 \
  libdrm2 \
  libgbm1 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2
```

## 📈 Statistiky

Po každém spuštění scraper vypíše:
- ✅ Počet nalezených inzerátů
- 🆕 Nové inzeráty
- 💰 Změny cen
- 🗑️ Odebrané inzeráty
- ⏱️ Čas běhu

## 🔐 Bezpečnost

- ❌ **NIKDY** necommitujte `service-account.json` do Gitu
- ❌ **NIKDY** nesdílejte service account klíč
- ✅ Přidejte `service-account.json` do `.gitignore`
- ✅ Pro produkci použijte environment proměnné

## 📝 Příklad výstupu

```
🚀 Spouštím Puppeteer scraper...

🔍 Načítám stránku 1...
   https://www.sreality.cz/hledani/prodej/byty/praha-2,praha-3,...
   
   ✓ Nalezeno 20 inzerátů

🔍 Načítám stránku 2...
   ✓ Nalezeno 20 inzerátů

...

✅ Celkem načteno 200 inzerátů

📊 Připojuji se k Google Sheets...
✅ Google Sheets API připojeno

📝 Zapisuji data...
✅ Zapsáno 200 inzerátů do Google Sheets

======================================================================
✅ HOTOVO!
======================================================================

Zapsáno 200 inzerátů
Zobrazit v Google Sheets:
https://docs.google.com/spreadsheets/d/12ZhQXFF_h-xyCB-nByNyE_mMBJ3M1BcgqQ2QshVk4Ck/edit
```

## 🎓 Další kroky

1. **Otestujte scraper lokálně** - `npm run scrape`
2. **Ověřte data v Google Sheets**
3. **Nastavte cron job** pro automatické spouštění
4. **Sledujte logy** pro případné chyby
5. **Upravte filtrační parametry** podle vašich potřeb

---

**Vytvořeno pro Reality v Kapse** 🏠  
**Verze:** 1.0.0  
**Datum:** 2025-10-07
