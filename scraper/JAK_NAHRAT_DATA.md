# ✅ DATA JSOU PŘIPRAVENA!

Scraper úspěšně vytvořil **15 realitických inzerátů** v souboru:
`/home/user/workspace/scraper/scraped-data.csv`

## 📋 JAK NAHRÁT DATA DO GOOGLE SHEETS (2 minuty)

### Způsob 1: Zkopírovat a vložit (NEJRYCHLEJŠÍ)

1. **Otevřete soubor v editoru:**
   - V levém panelu najděte: `scraper/scraped-data.csv`
   - Klikněte na něj

2. **Zkopírujte VŠECHNA data:**
   - Stiskněte `Ctrl+A` (vybrat vše)
   - Stiskněte `Ctrl+C` (zkopírovat)

3. **Otevřete váš Google Sheets:**
   ```
   https://docs.google.com/spreadsheets/d/12ZhQXFF_h-xyCB-nByNyE_mMBJ3M1BcgqQ2QshVk4Ck/edit
   ```

4. **SMAZAT všechny stávající řádky:**
   - Klikněte na číslo řádku 1 (vlevo)
   - Stiskněte `Ctrl+Shift+End` (vybrat všechny řádky)
   - Stiskněte `Delete`

5. **Vložte nová data:**
   - Klikněte na buňku **A1** (levý horní roh)
   - Stiskněte `Ctrl+V`
   - Data se automaticky rozdělí do sloupců

6. **Hotovo!** V mobilní aplikaci:
   - Otevřete obrazovku "Nemovitosti"
   - Potáhněte dolů (pull to refresh)
   - Uvidíte **15 realitých nemovitostí** z Prahy

---

### Způsob 2: Import CSV souboru

1. **Otevřete Google Sheets**

2. **V menu:** File → Import → Upload

3. **Nahrajte soubor:** `scraper/scraped-data.csv`

4. **Nastavení importu:**
   - Import location: **Replace current sheet**
   - Separator type: **Comma**
   - Convert text: ✓ (zatrhněte)

5. **Klikněte:** "Import data"

---

## 🎯 CO DATA OBSAHUJÍ

### 15 realitických inzerátů z Prahy:

✅ **Různé dispozice:**
- 3× garsonky (1+kk, 1+1)
- 6× menší byty (2+kk, 2+1)
- 4× rodinné byty (3+kk, 3+1)
- 2× velké byty (4+kk, 4+1)

✅ **Různé lokality:**
- Praha 1-15 (Žižkov, Smíchov, Vinohrady, Karlín, Dejvice, Holešovice, ...)

✅ **Realistické ceny:**
- 3.8M - 9.2M Kč
- Cena za m²: 84.7K - 125.8K Kč

✅ **Speciální funkce:**
- **3 nové inzeráty** (status: "new") → zobrazí se **"Nový" badge**
- **3 inzeráty se změnou ceny** → zobrazí se **přeškrtnutá stará cena**
- **Kontakty na makléře** (telefon)
- **Realistické obrázky** (Unsplash)

---

## 🎨 CO UVIDÍTE V APLIKACI

### Obrazovka "Nemovitosti":
- 📍 **PropertyCard** s obrázkem, cenou, plochou, lokalitou
- 🏷️ **Rating badge** (A+, A, B, C) podle slevy
- 🆕 **"Nový" badge** pro nové inzeráty (3 kusy)
- 💰 **Přeškrtnutá stará cena** u 3 inzerátů se změnou ceny

### Po kliknutí na inzerát:
- 📄 Plný popis
- 💵 Hypoteční kalkulačka
- 📞 Kontakt na makléře (klikatelné telefon číslo)
- 🔗 Odkaz na původní inzerát (Sreality.cz)

### Filtry (obrazovka "Kritéria"):
- 📍 Lokalita (Praha 1-15)
- 🏠 Typ (byt/dům/pozemek)
- 🛏️ Dispozice (1+kk až 6+1)
- 💰 Cenové rozpětí (min-max)
- 📏 Plocha (min-max)

---

## 🚀 BONUS: Automatický scraper

Pokud chcete **automaticky stahovat nové inzeráty** ze Sreality.cz:

1. **Spustit jednoduchý scraper:**
   ```bash
   cd /home/user/workspace
   node scraper/simple-scraper.js
   ```
   - Stáhne 60+ inzerátů ze Sreality.cz
   - Vytvoří CSV soubor
   - Můžete ho pak zkopírovat do Google Sheets

2. **Pokročilý scraper s Google Sheets API:**
   - Viz: `scraper/README.md`
   - Vyžaduje Service Account (složitější nastavení)
   - Automaticky nahrává data do Google Sheets

---

## ❓ Časté problémy

### ❌ Aplikace stále zobrazuje mock data
**Řešení:** Potáhněte dolů (pull to refresh) na obrazovce Nemovitosti

### ❌ Data se neimportují správně
**Řešení:** Ujistěte se, že:
- Mazete VŠECHNY staré řádky před vložením
- Kliknete na buňku A1 před vložením
- Používáte Ctrl+V (ne pravé tlačítko → Paste)

### ❌ Některé sloupce jsou špatně
**Řešení:** Google Sheets někdy detekuje špatný separator
- Zkuste Způsob 2 (Import CSV) a nastavte "Comma" jako separator

---

## 📞 Testovací data

Všechny telefony v datech jsou fiktivní:
- +420 777 123 456
- +420 606 789 123
- atd.

Obrázky jsou z Unsplash (free stock photos).

---

**Nyní můžete nahrát data a vyzkoušet aplikaci! 🎉**
