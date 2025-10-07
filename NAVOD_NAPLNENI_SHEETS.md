# Návod: Jak naplnit Google Sheets daty

## Problém
Aplikace se nemůže připojit k Google Sheets nebo tabulka je prázdná.

## Řešení 1: Manuální kopírování (NEJRYCHLEJŠÍ)

1. **Otevřete soubor `google-sheets-template.csv` ve Visual Studio Code nebo textovém editoru**

2. **Zkopírujte VŠECHNA data** (včetně header řádku)

3. **Otevřete váš Google Sheets:**
   https://docs.google.com/spreadsheets/d/12ZhQXFF_h-xyCB-nByNyE_mMBJ3M1BcgqQ2QshVk4Ck/edit

4. **Vložte data:**
   - Klikněte na buňku A1
   - Stiskněte Ctrl+V (Windows) nebo Cmd+V (Mac)
   - Data by se měla automaticky rozdělit do sloupců

5. **Zkontrolujte sdílení:**
   - Klikněte na tlačítko "Share" (Sdílet) vpravo nahoře
   - Ujistěte se, že je nastaveno: **"Anyone with the link" → "Viewer"**
   - Klikněte "Done"

6. **Restartujte aplikaci**

---

## Řešení 2: Import CSV souboru

1. **Otevřete váš Google Sheets**

2. **V menu vyberte:** File → Import → Upload

3. **Nahrajte soubor** `google-sheets-template.csv`

4. **Nastavení importu:**
   - Import location: Replace current sheet
   - Separator type: Comma
   - Convert text: ✓ (zatrhněte)

5. **Klikněte "Import data"**

6. **Zkontrolujte sdílení** (viz Řešení 1, krok 5)

---

## Řešení 3: Použití scraperu (AUTOMATICKÉ)

Scraper automaticky stáhne data ze Sreality.cz a nahraje je do Google Sheets.

### Příprava:

1. **Vytvořte Service Account v Google Cloud:**
   - Jděte na: https://console.cloud.google.com
   - Vytvořte nový projekt nebo vyberte existující
   - Zapněte Google Sheets API
   - Vytvořte Service Account
   - Stáhněte JSON klíč

2. **Uložte klíč:**
   ```bash
   # Zkopírujte stažený JSON soubor do scraper složky
   cp ~/Downloads/service-account-*.json scraper/service-account.json
   ```

3. **Sdílejte Google Sheets se Service Account:**
   - Otevřete JSON soubor a najděte "client_email"
   - V Google Sheets klikněte "Share"
   - Přidejte tento email s oprávněním "Editor"

4. **Nakonfigurujte scraper:**
   ```bash
   cd scraper
   nano sreality-scraper-puppeteer.js
   ```
   
   Upravte řádek:
   ```javascript
   const SHEET_ID = '12ZhQXFF_h-xyCB-nByNyE_mMBJ3M1BcgqQ2QshVk4Ck';
   ```

5. **Nainstalujte dependencies:**
   ```bash
   npm install
   ```

6. **Spusťte scraper:**
   ```bash
   npm run scrape
   ```

Scraper stáhne až 200 inzerátů ze Sreality.cz a nahraje je do Google Sheets!

---

## Testování připojení

Po naplnění dat zkontrolujte, že vše funguje:

```bash
curl -L "https://docs.google.com/spreadsheets/d/12ZhQXFF_h-xyCB-nByNyE_mMBJ3M1BcgqQ2QshVk4Ck/export?format=csv" | head -5
```

Měli byste vidět CSV data, ne HTML error stránku.

---

## Časté problémy

### ❌ "HTTP error 401" nebo "403"
**Řešení:** Google Sheets není veřejně přístupný
- Klikněte "Share" → "Anyone with the link" → "Viewer"

### ❌ Aplikace zobrazuje mock data
**Řešení:** Google Sheets je prázdný nebo nepřístupný
- Zkontrolujte, že tabulka obsahuje data (včetně header řádku)
- Zkontrolujte sdílení

### ❌ Scraper hlásí "Authentication failed"
**Řešení:** Service Account nemá přístup
- Sdílejte Google Sheets s emailem ze service-account.json
- Ujistěte se, že soubor service-account.json je ve složce scraper/

### ❌ Data v aplikaci nejsou aktuální
**Řešení:** Potáhněte dolů pro refresh
- V aplikaci na obrazovce "Nemovitosti" potáhněte dolů
- To znovu načte data z Google Sheets

---

## Struktura dat v Google Sheets

Tabulka MUSÍ mít tyto sloupce v tomto pořadí:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ID | Název | Popis | Cena | Plocha | Lokalita | Typ | Dispozice | Sleva % | URL obrázku | URL inzerátu | Jméno makléře | Telefon | Email | Společnost |

### Příklad řádku:

```csv
prop-001,Moderní byt v centru Prahy,"Krásný světlý byt...",6500000,68,Praha 3 Žižkov,byt,2+kk,18,https://...,https://sreality.cz/...,Jan Novák,+420 777 123 456,jan.novak@...,RE/MAX
```

---

## Kontakt

Pokud problémy přetrvávají, zkontrolujte:
1. ✅ Sheet ID v .env je správné: `12ZhQXFF_h-xyCB-nByNyE_mMBJ3M1BcgqQ2QshVk4Ck`
2. ✅ Google Sheets obsahuje data (včetně header řádku)
3. ✅ Sdílení je nastaveno na "Anyone with the link can view"
4. ✅ Aplikace je restartovaná po změnách
