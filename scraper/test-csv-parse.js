const csvLine = '1666904908,https://www.sreality.cz/detail/prodej/byt/1+kk/brno-zebetin-jerlinova/1666904908,Prodej bytu 1+kk 71 m²,"Jerlínová, Brno - Žebětín",1+kk,71,5 150 000 Kč,72 535 Kč,,,"https://d18-a.sdn.cz/d_18/c_img_od_D/nPSV1TXV2nCruJ2CIwEbnDPa/76d8.jpeg?fl=res,400,300,3|shr,,20|jpg,90",,2025-10-08T06:48:16.618Z,2025-10-08T06:48:41.479Z,2025-10-08T06:48:16.618Z,2025-10-08T06:48:41.479Z,,,new,17167';

function parseCSVLine(line) {
  const result = [];
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

const parsed = parseCSVLine(csvLine);

console.log("Počet sloupců:", parsed.length);
console.log("\nSloupce 0-9:");
parsed.slice(0, 10).forEach((col, i) => {
  console.log(`  [${i}] ${col}`);
});
