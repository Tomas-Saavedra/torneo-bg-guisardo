// Parser simple y robusto para CSV "normal" (como el export de Google Sheets).
// - Ignora líneas vacías
// - Si falta una columna en una fila, completa con ""
// - Nunca hace .toString() sobre undefined

export function parseCsv(text: string): Record<string, string>[] {
  if (!text) return [];

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const headers = splitCsvLine(lines[0]).map((h) => cleanCell(h));

  const out: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const raw = splitCsvLine(lines[i]);
    // Si la fila está vacía o solo tiene comas, saltala
    if (raw.length === 0) continue;

    const row: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      if (!key) continue;
      row[key] = cleanCell(raw[c] ?? "");
    }
    out.push(row);
  }

  return out;
}

// Divide una línea CSV respetando comillas.
function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      // Doble comilla dentro de comillas => "
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      result.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }

  result.push(cur);
  return result;
}

function cleanCell(v: string): string {
  // v siempre string acá
  return (v ?? "").trim();
}
