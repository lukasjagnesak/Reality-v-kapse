# Návod pro Google Sheets - Reality v Kapse

## 📋 Přehled

Aplikace Reality v Kapse může načítat data nemovitostí z Google Sheets. To umožňuje snadnou správu inzerátů bez nutnosti backendu.

## 🚀 Rychlý start

### 1. Vytvoření Google Sheets

1. Otevřete [Google Sheets](https://sheets.google.com)
2. Vytvořte nový dokument: **Soubor > Nový > Tabulka**
3. Pojmenujte ho například: "Reality v Kapse - Inzeráty"

### 2. Nastavení sloupců

První řádek musí obsahovat názvy sloupců (header). Vytvořte následující sloupce **v tomto přesném pořadí**:

| Sloupec | Název | Povinné | Příklad |
|---------|-------|---------|---------|
| A | ID | ✅ | `prop-001` |
| B | Název | ✅ | `Moderní byt v centru Prahy` |
| C | Popis | ❌ | `Krásný světlý byt po rekonstrukci...` |
| D | Cena | ✅ | `6500000` |
| E | Plocha | ✅ | `68` |
| F | Lokalita | ✅ | `Praha 3, Žižkov` |
| G | Typ | ✅ | `byt` |
| H | Dispozice | ✅ | `2+kk` |
| I | Sleva v % | ❌ | `18` |
| J | URL obrázku | ❌ | `https://i.imgur.com/abc123.jpg` |
| K | URL inzerátu | ❌ | `https://sreality.cz/detail/...` |
| L | Jméno makléře | ❌ | `Jan Novák` |
| M | Telefon makléře | ❌ | `+420 777 123 456` |
| N | Email makléře | ❌ | `jan.novak@realestate.cz` |
| O | Společnost | ❌ | `RE/MAX` |

### 3. Příklad řádku

```
A: prop-001
B: Moderní byt v centru Prahy
C: Krásný světlý byt po rekonstrukci v blízkosti metra. Kompletně vybavený s balkonem.
D: 6500000
E: 68
F: Praha 3, Žižkov
G: byt
H: 2+kk
I: 18
J: https://i.imgur.com/abc123.jpg
K: https://sreality.cz/detail/prodej/byt/2+kk/praha-3-zizkov/
L: Jan Novák
M: +420 777 123 456
N: jan.novak@realestate.cz
O: RE/MAX
```

## 🖼️ Správa obrázků

### Doporučené služby pro hosting obrázků:

#### 1. **Imgur** (Doporučeno - nejjednodušší)

1. Jděte na [imgur.com](https://imgur.com)
2. Klikněte na "New post"
3. Nahrajte obrázek
4. Po nahrání klikněte pravým tlačítkem na obrázek
5. Zvolte "Copy image address"
6. Vložte do sloupce "URL obrázku"

#### 2. **Google Drive**

1. Nahrajte obrázek do Google Drive
2. Klikněte pravým tlačítkem > **Získat odkaz**
3. Nastavte oprávnění na **"Kdokoli s odkazem může zobrazit"**
4. Zkopírujte ID souboru z URL (část mezi `/d/` a `/view`)
5. Použijte tento formát:
   ```
   https://drive.google.com/uc?export=view&id=FILE_ID
   ```

#### 3. **ImgBB**

1. Jděte na [imgbb.com](https://imgbb.com)
2. Nahrajte obrázek
3. Zkopírujte "Direct link"

## 🔑 Zpřístupnění tabulky

1. V Google Sheets klikněte na **Sdílet** (vpravo nahoře)
2. Klikněte na **Změnit**
3. Vyberte **"Kdokoli s odkazem"** a **"Zobrazující"**
4. Klikněte **Hotovo**
5. Zkopírujte odkaz

## 📱 Připojení k aplikaci

### Získání Sheet ID

Z URL vašeho Google Sheets:
```
https://docs.google.com/spreadsheets/d/1ABC...XYZ/edit#gid=0
                                      ^^^^^^^^^ toto je Sheet ID
```

### Nastavení v aplikaci

1. Otevřete soubor `.env` v kořenové složce projektu
2. Přidejte řádek:
   ```
   EXPO_PUBLIC_GOOGLE_SHEETS_ID=vaše_sheet_id
   ```
3. Restartujte aplikaci

### Příklad .env souboru:

```env
EXPO_PUBLIC_GOOGLE_SHEETS_ID=1ABCdefGHIjklMNOpqrSTUvwxYZ123456789
```

## 📝 Validační pravidla

### Typ nemovitosti (sloupec G)
Povolené hodnoty:
- `byt`
- `dům`
- `pozemek`
- `komerční`

### Dispozice (sloupec H)
Povolené hodnoty:
- `1+kk`, `1+1`
- `2+kk`, `2+1`
- `3+kk`, `3+1`
- `4+kk`, `4+1`
- `5+kk`, `5+1`
- `6+kk`, `6+1`
- `atypický`

### Cena (sloupec D)
- Pouze čísla
- Bez mezer nebo speciálních znaků
- Příklad: `6500000` (ne `6 500 000 Kč`)

### Plocha (sloupec E)
- Pouze čísla
- V metrech čtverečních
- Příklad: `68` (ne `68 m²`)

### Sleva v % (sloupec I)
- Číslo od 0 do 100
- Určuje hodnocení nemovitosti:
  - **15+%** = A+ (zelená)
  - **10-15%** = A (modrá)
  - **5-10%** = B (oranžová)
  - **0-5%** = C (červená)

## 🔄 Aktualizace dat

Aplikace načítá data:
1. Při spuštění
2. Při pull-to-refresh (potažení dolů)
3. Automaticky při přepnutí záložky

**Změny v Google Sheets se projeví okamžitě po refreshi!**

## 🎨 Šablona Google Sheets

Můžete si zkopírovat [tuto šablonu](https://docs.google.com/spreadsheets/d/YOUR_TEMPLATE_ID/copy) a začít hned:

### Header řádek (řádek 1):
```
ID | Název | Popis | Cena | Plocha | Lokalita | Typ | Dispozice | Sleva v % | URL obrázku | URL inzerátu | Jméno makléře | Telefon makléře | Email makléře | Společnost
```

## ⚠️ Běžné chyby

### 1. Aplikace nenačítá data
- ✅ Zkontrolujte, že je tabulka sdílená jako "Kdokoli s odkazem"
- ✅ Ověřte správné Sheet ID v `.env`
- ✅ Restartujte aplikaci po změně `.env`

### 2. Obrázky se nezobrazují
- ✅ Použijte přímý odkaz na obrázek (končí na .jpg, .png)
- ✅ Pro Google Drive použijte formát s `/uc?export=view&id=`
- ✅ Ověřte, že je obrázek veřejně přístupný

### 3. Nemovitost má špatný typ nebo dispozici
- ✅ Zkontrolujte přesný název (velká/malá písmena)
- ✅ Použijte pouze povolené hodnoty z tabulky výše

### 4. Aplikace používá mock data
- ✅ Znamená to, že Google Sheets nevrátil žádná data
- ✅ Zkontrolujte všechny body výše

## 💡 Tipy

### Hromadná úprava
- Použijte funkce Google Sheets pro hromadné operace
- Například vzorce pro automatický výpočet ceny za m²: `=D2/E2`

### Řazení
- Seřaďte inzeráty podle data (nejnovější nahoře)
- Aplikace zachová pořadí z tabulky

### Filtrování
- V Google Sheets můžete použít filtry
- Aplikace zobrazí pouze viditelné řádky

### Formátování
- Můžete používat barvy pro lepší orientaci
- Aplikace ignoruje formátování (používá pouze data)

## 🔐 Bezpečnost

**DŮLEŽITÉ:**
- Nikdy nesdílejte Sheet ID veřejně
- Tabulka by měla být pouze "Zobrazující" (ne "Upravující")
- Pro citlivá data zvažte použití backend API

## 📞 Podpora

Pokud máte problémy:
1. Zkontrolujte console logy v aplikaci
2. Ověřte strukturu tabulky
3. Zkuste načíst data pomocí curl:
   ```bash
   curl "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv"
   ```

---

**Verze:** 1.0.0  
**Poslední aktualizace:** 2025-10-07
