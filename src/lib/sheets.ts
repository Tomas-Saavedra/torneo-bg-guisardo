// src/lib/sheets.ts
// Carga data desde Google Sheets publicados como CSV (por URL en env vars)

export type Player = {
  id: string;
  name: string;
};

export type Game = {
  game_id: string;
  name: string;
  type?: string;
  multiplier?: number;
  min_p?: number;
  max_p?: number;
  image_url?: string;
};

export type ScheduleRow = {
  date: string; // YYYY-MM-DD
  start_time?: string;
  end_time?: string;
  location?: string;
  notes?: string;
};

export type MatchRow = {
  session_date: string; // YYYY-MM-DD
  game_id: string;
  start_time?: string;
  p1?: string;
  p2?: string;
  p3?: string;
  p4?: string;
  p5?: string;
};

// ---- CSV helpers ----

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '"') {
      const next = text[i + 1];
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && (ch === "," || ch === "\n" || ch === "\r")) {
      if (ch === "\r" && text[i + 1] === "\n") i++; // CRLF
      row.push(cell);
      cell = "";

      if (ch === "\n" || ch === "\r") {
        // cerrar fila (si no es una fila vacía)
        const isEmpty = row.every((c) => (c ?? "").trim() === "");
        if (!isEmpty) rows.push(row);
        row = [];
      }
      continue;
    }

    cell += ch;
  }

  // último campo/fila
  row.push(cell);
  const isEmpty = row.every((c) => (c ?? "").trim() === "");
  if (!isEmpty) rows.push(row);

  return rows;
}

function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => String(h ?? "").trim());
  const out: Record<string, string>[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j];
      if (!key) continue;
      obj[key] = String(r[j] ?? "").trim();
    }
    out.push(obj);
  }
  return out;
}

async function fetchCsvObjects(url: string): Promise<Record<string, string>[]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`CSV fetch failed (${res.status}) for ${url}`);
  const text = await res.text();
  const rows = parseCSV(text);
  return rowsToObjects(rows);
}

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

// ---- Public loaders ----

export async function loadPlayers(): Promise<Player[]> {
  const url = env("SHEETS_PLAYERS_CSV_URL");
  if (!url) return [];
  const objs = await fetchCsvObjects(url);

  return objs
    .map((o) => ({
      id: String(o.player_id ?? o.id ?? "").trim(),
      name: String(o.name ?? o.player_id ?? o.id ?? "").trim(),
    }))
    .filter((p) => p.id);
}

export async function loadGames(): Promise<Game[]> {
  const url = env("SHEETS_GAMES_CSV_URL");
  if (!url) return [];
  const objs = await fetchCsvObjects(url);

  return objs
    .map((o) => ({
      game_id: String(o.game_id ?? "").trim(),
      name: String(o.name ?? o.game_id ?? "").trim(),
      type: String(o.type ?? "").trim() || undefined,
      multiplier: o.multiplier ? Number(String(o.multiplier).trim()) : undefined,
      min_p: o.min_p ? Number(String(o.min_p).trim()) : undefined,
      max_p: o.max_p ? Number(String(o.max_p).trim()) : undefined,
      image_url: String(o.image_url ?? "").trim() || undefined,
    }))
    .filter((g) => g.game_id);
}

export async function loadSchedule(): Promise<ScheduleRow[]> {
  const url = env("SHEETS_SCHEDULE_CSV_URL");
  if (!url) return [];
  const objs = await fetchCsvObjects(url);

  return objs
    .map((o) => ({
      date: String(o.date ?? "").trim(),
      start_time: String(o.start_time ?? "").trim() || undefined,
      end_time: String(o.end_time ?? "").trim() || undefined,
      location: String(o.location ?? "").trim() || undefined,
      notes: String(o.notes ?? "").trim() || undefined,
    }))
    .filter((s) => s.date);
}

export async function loadMatches(): Promise<MatchRow[]> {
  const url = env("SHEETS_MATCHES_CSV_URL");
  if (!url) return [];
  const objs = await fetchCsvObjects(url);

  return objs
    .map((o) => ({
      session_date: String(o.session_date ?? o.date ?? "").trim(),
      game_id: String(o.game_id ?? "").trim(),
      start_time: String(o.start_time ?? "").trim() || undefined,
      p1: String(o.p1 ?? "").trim() || undefined,
      p2: String(o.p2 ?? "").trim() || undefined,
      p3: String(o.p3 ?? "").trim() || undefined,
      p4: String(o.p4 ?? "").trim() || undefined,
      p5: String(o.p5 ?? "").trim() || undefined,
    }))
    .filter((m) => m.session_date && m.game_id);
}
