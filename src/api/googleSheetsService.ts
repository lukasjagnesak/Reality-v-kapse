import type { Property, PropertyType, PropertyDisposition } from "../types/property";
import { calculatePropertyRating } from "../utils/propertyUtils";

/**
 * Google Sheets API Service
 * 
 * Tento soubor obsahuje funkce pro načítání dat z Google Sheets.
 * 
 * NASTAVENÍ GOOGLE SHEETS:
 * 1. Vytvořte nový Google Sheet
 * 2. Sdílejte ho jako "Anyone with the link can view"
 * 3. Zkopírujte ID z URL (část mezi /d/ a /edit)
 * 4. Nastavte GOOGLE_SHEETS_ID v .env souboru
 * 
 * STRUKTURA TABULKY:
 * Tabulka musí mít následující sloupce (v tomto pořadí):
 * 
 * A: ID (unikátní identifikátor)
 * B: Název (název nemovitosti)
 * C: Popis (detailní popis)
 * D: Cena (celková cena v Kč, např: 5500000)
 * E: Plocha (v m², např: 68)
 * F: Lokalita (např: "Praha 3, Žižkov")
 * G: Typ (byt / dům / pozemek / komerční)
 * H: Dispozice (1+kk, 2+kk, atd.)
 * I: Sleva v % (např: 18)
 * J: URL obrázku (odkaz na obrázek, ideálně z Google Drive nebo Imgur)
 * K: URL inzerátu (odkaz na původní inzerát)
 * L: Jméno makléře
 * M: Telefon makléře (např: +420 123 456 789)
 * N: Email makléře
 * O: Společnost (volitelné)
 * 
 * První řádek je HEADER - přeskakuje se při načítání.
 */

/**
 * Získá ID Google Sheets z environment proměnných
 */
function getGoogleSheetsId(): string | null {
  // V produkci byste měli mít toto nastavené v .env
  const sheetId = process.env.EXPO_PUBLIC_GOOGLE_SHEETS_ID;
  return sheetId || null;
}

/**
 * Vytvoří URL pro načtení dat z Google Sheets ve formátu CSV
 */
function getGoogleSheetsUrl(sheetId: string): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
}

/**
 * Parsuje CSV řádek s ohledem na uvozovky
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Převede řádek z Google Sheets na Property objekt
 * Podporuje DVĚ struktury:
 * 1. Manuální struktura (ID, Název, Popis, Cena, Plocha, Lokalita, Typ, Dispozice, Sleva %, ...)
 * 2. Scraper struktura (hash_id, url, titulek, lokalita, dispozice, plocha_m2, cena, ...)
 */
function rowToProperty(row: string[], index: number, headers: string[]): Property | null {
  try {
    // Detekce struktury podle prvního sloupce v headeru
    const isScraperFormat = headers[0]?.toLowerCase().includes("hash_id");
    
    if (isScraperFormat) {
      // Scraper formát: hash_id, url, titulek, lokalita, dispozice, plocha_m2, cena, cena_za_m2, patro, stav_objektu, image_url, telefon, vlozeno_at, upraveno_at, first_seen_at, last_seen_at, last_price, price_changed_at, status, hypo_mesic
      const [
        hash_id,
        url,
        titulek,
        lokalita,
        dispozice,
        plocha_m2,
        cena,
        cena_za_m2,
        patro,
        stav_objektu,
        image_url,
        telefon,
        vlozeno_at,
        upraveno_at,
        first_seen_at,
        last_seen_at,
        last_price,
        price_changed_at,
        status,
        hypo_mesic,
      ] = row;

      // Validace povinných polí
      if (!hash_id || !titulek || !cena || !plocha_m2 || !lokalita) {
        console.warn(`Řádek ${index + 2} přeskočen - chybí povinná pole`);
        return null;
      }

      const price = parseFloat(cena.replace(/[^\d.-]/g, ""));
      const area = parseFloat(plocha_m2.replace(/[^\d.-]/g, ""));
      const pricePerM2 = parseFloat(cena_za_m2?.replace(/[^\d.-]/g, "") || "0") || Math.round(price / area);
      
      // Vypočítat slevu z price history
      let discountPercentage = 0;
      if (last_price && price_changed_at) {
        const lastPriceNum = parseFloat(last_price.replace(/[^\d.-]/g, ""));
        if (lastPriceNum > price) {
          discountPercentage = Math.round(((lastPriceNum - price) / lastPriceNum) * 100);
        }
      }

      // Detekovat typ z URL nebo lokality
      let propertyType: PropertyType = "byt";
      if (url?.includes("/dum/") || titulek?.toLowerCase().includes("dům")) {
        propertyType = "dům";
      } else if (url?.includes("/pozemek/")) {
        propertyType = "pozemek";
      } else if (url?.includes("/komercni/")) {
        propertyType = "komerční";
      }

      // Validace dispozice
      const validDispositions = [
        "1+kk", "1+1", "2+kk", "2+1", "3+kk", "3+1",
        "4+kk", "4+1", "5+kk", "5+1", "6+kk", "6+1", "atypický"
      ];
      const propertyDisposition = validDispositions.includes(dispozice)
        ? (dispozice as PropertyDisposition)
        : "2+kk";

      const property: Property = {
        id: hash_id.trim(),
        title: titulek.trim(),
        description: `${stav_objektu || "Popis není k dispozici"}${patro ? `, ${patro}` : ""}`,
        price,
        area,
        pricePerM2,
        location: lokalita.trim(),
        type: propertyType,
        disposition: propertyDisposition,
        rating: calculatePropertyRating(discountPercentage),
        discountPercentage,
        imageUrl: image_url?.trim() || "https://via.placeholder.com/800x600?text=Bez+obrázku",
        source: "sreality",
        sourceUrl: url?.trim() || "",
        createdAt: vlozeno_at ? new Date(vlozeno_at) : new Date(),
        isNew: status === "new",
      };

      // Přidat price history pokud existuje
      if (last_price && price_changed_at) {
        const lastPriceNum = parseFloat(last_price.replace(/[^\d.-]/g, ""));
        if (lastPriceNum !== price) {
          property.priceHistory = {
            oldPrice: lastPriceNum,
            newPrice: price,
            changedAt: new Date(price_changed_at),
          };
        }
      }

      // Přidat kontakt na makléře
      if (telefon) {
        property.agent = {
          name: "Makléř",
          phone: telefon.trim(),
        };
      }

      return property;
      
    } else {
      // Manuální formát: ID, Název, Popis, Cena, Plocha, Lokalita, Typ, Dispozice, Sleva v %, URL obrázku, URL inzerátu, Jméno makléře, Telefon makléře, Email makléře, Společnost
      const [
        id,
        title,
        description,
        priceStr,
        areaStr,
        location,
        type,
        disposition,
        discountStr,
        imageUrl,
        sourceUrl,
        agentName,
        agentPhone,
        agentEmail,
        agentCompany,
      ] = row;

      // Validace povinných polí
      if (!id || !title || !priceStr || !areaStr || !location) {
        console.warn(`Řádek ${index + 2} přeskočen - chybí povinná pole`);
        return null;
      }

      const price = parseFloat(priceStr.replace(/[^\d.-]/g, ""));
      const area = parseFloat(areaStr.replace(/[^\d.-]/g, ""));
      const discountPercentage = parseFloat(discountStr?.replace(/[^\d.-]/g, "") || "0");
      const pricePerM2 = Math.round(price / area);

      // Validace typu a dispozice
      const validTypes = ["byt", "dům", "pozemek", "komerční"];
      const propertyType = validTypes.includes(type?.toLowerCase())
        ? (type.toLowerCase() as PropertyType)
        : "byt";

      const validDispositions = [
        "1+kk", "1+1", "2+kk", "2+1", "3+kk", "3+1",
        "4+kk", "4+1", "5+kk", "5+1", "6+kk", "6+1", "atypický"
      ];
      const propertyDisposition = validDispositions.includes(disposition)
        ? (disposition as PropertyDisposition)
        : "2+kk";

      const property: Property = {
        id: id.trim(),
        title: title.trim(),
        description: description?.trim() || "Popis není k dispozici",
        price,
        area,
        pricePerM2,
        location: location.trim(),
        type: propertyType,
        disposition: propertyDisposition,
        rating: calculatePropertyRating(discountPercentage),
        discountPercentage,
        imageUrl: imageUrl?.trim() || "https://via.placeholder.com/800x600?text=Bez+obrázku",
        source: "google_sheets",
        sourceUrl: sourceUrl?.trim() || "",
        createdAt: new Date(),
      };

      // Přidat kontakt na makléře, pokud je k dispozici
      if (agentName || agentPhone || agentEmail) {
        property.agent = {
          name: agentName?.trim() || "Kontakt není k dispozici",
          phone: agentPhone?.trim(),
          email: agentEmail?.trim(),
          company: agentCompany?.trim(),
        };
      }

      return property;
    }
  } catch (error) {
    console.error(`Chyba při parsování řádku ${index + 2}:`, error);
    return null;
  }
}

/**
 * Načte všechny nemovitosti z Google Sheets
 */
export async function fetchPropertiesFromGoogleSheets(): Promise<Property[]> {
  const sheetId = getGoogleSheetsId();

  if (!sheetId) {
    console.warn(
      "⚠️  GOOGLE_SHEETS_ID není nastaveno. Přidejte EXPO_PUBLIC_GOOGLE_SHEETS_ID do .env souboru."
    );
    return [];
  }

  try {
    const url = getGoogleSheetsUrl(sheetId);
    console.log("📊 Načítám data z Google Sheets...");
    console.log(`   Sheet ID: ${sheetId.substring(0, 20)}...`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv, application/csv, text/plain',
      },
    });

    console.log(`📡 Response status: ${response.status}`);
    console.log(`📡 Response headers:`, response.headers);

    if (response.status === 401 || response.status === 403) {
      console.error("❌ Google Sheets není veřejně přístupný!");
      console.error("📝 Postupujte takto:");
      console.error("   1. Otevřete Google Sheets");
      console.error("   2. Klikněte na 'Sdílet' (Share)");
      console.error("   3. Změňte na 'Anyone with the link can view'");
      console.error("   4. Klikněte 'Done'");
      console.error("   5. Restartujte aplikaci");
      console.error("   ");
      console.error("🔧 Alternativa: Zkopírujte testovací data z google-sheets-template.csv do Google Sheets");
      return [];
    }

    if (!response.ok) {
      console.error(`❌ HTTP error! status: ${response.status}`);
      console.error("📝 Zkontrolujte, že:");
      console.error("   1. Google Sheets existuje");
      console.error("   2. Je sdílený jako 'Anyone with the link can view'");
      console.error("   3. Sheet ID v .env je správné");
      return [];
    }

    const csvText = await response.text();
    
    // Zkontrolovat, zda se nejedná o HTML (error page)
    if (csvText.trim().startsWith('<!DOCTYPE') || csvText.trim().startsWith('<html')) {
      console.error("❌ Google Sheets vrátil HTML místo CSV - tabulka není veřejně přístupná!");
      console.error("📝 Otevřete tabulku a nastavte sdílení na 'Anyone with the link can view'");
      return [];
    }
    
    const lines = csvText.split("\n").filter((line) => line.trim());

    if (lines.length === 0) {
      console.warn("⚠️  Google Sheets je prázdný");
      return [];
    }

    // Přeskočit první řádek (header) ale uložit ho pro detekci formátu
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine);
    const dataLines = lines.slice(1);

    if (dataLines.length === 0) {
      console.warn("⚠️  Google Sheets obsahuje pouze header, žádná data");
      return [];
    }

    const properties: Property[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      const row = parseCSVLine(dataLines[i]);
      const property = rowToProperty(row, i, headers);

      if (property) {
        properties.push(property);
      }
    }

    console.log(`✅ Načteno ${properties.length} nemovitostí z Google Sheets`);
    return properties;
  } catch (error) {
    console.error("❌ Chyba při načítání dat z Google Sheets:", error);
    return [];
  }
}

/**
 * Pro sdílení obrázků z Google Drive:
 * 
 * 1. Nahrajte obrázek do Google Drive
 * 2. Klikněte pravým tlačítkem -> Získat odkaz
 * 3. Nastavte oprávnění na "Anyone with the link can view"
 * 4. Zkopírujte ID souboru z URL (část za /d/ a před /view)
 * 5. Použijte tento formát URL v tabulce:
 *    https://drive.google.com/uc?export=view&id=FILE_ID
 * 
 * Alternativně můžete použít služby jako:
 * - Imgur.com (doporučeno pro jednoduchost)
 * - ImgBB.com
 * - Cloudinary
 */

/**
 * Příklad řádku v Google Sheets:
 * 
 * ID: prop-001
 * Název: Moderní byt v centru Prahy
 * Popis: Krásný světlý byt po rekonstrukci...
 * Cena: 6500000
 * Plocha: 68
 * Lokalita: Praha 3, Žižkov
 * Typ: byt
 * Dispozice: 2+kk
 * Sleva v %: 18
 * URL obrázku: https://i.imgur.com/abc123.jpg
 * URL inzerátu: https://sreality.cz/detail/...
 * Jméno makléře: Jan Novák
 * Telefon makléře: +420 777 123 456
 * Email makléře: jan.novak@realestate.cz
 * Společnost: RE/MAX
 */
