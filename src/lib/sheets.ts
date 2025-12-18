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

  // NUEVO (game_id)
  heavy?: string;
  medium?: string;
  filler1?: string;
  filler2?: string;
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
        const isEmpty = row.every((c) => (c ?? "").trim() === "");
        if (!isEmpty) rows.push(row);
        row = [];
      }
      continue;
    }

    cell += ch;
  }

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

function toNum(v: unknown): number | undefined {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) ? n : undefined;
}

function cleanId(v: unknown): string | undefined {
  const s = String(v ?? "").trim();
  return s ? s : undefined;
}

// ---- Public loaders ----
export async function loadPlayers(): Promise<Player[]> {
  const url = env("SHEETS_PLAYERS_CSV_URL");
  if (!url) return [];
  const objs = await fetchCsvObjects(url);

  return objs
    .map((o) => {
      const id = String(o.player_id ?? o.id ?? "").trim();
      const name = String(o.name ?? o.player_id ?? o.id ?? "").trim();
      return { id, name };
    })
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
      type: cleanId(o.type),
      multiplier: toNum(o.multiplier),
      min_p: toNum(o.min_p),
      max_p: toNum(o.max_p),
      image_url: cleanId(o.image_url),
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
      start_time: cleanId(o.start_time),
      end_time: cleanId(o.end_time),
      location: cleanId(o.location),
      notes: cleanId(o.notes),

      // NUEVO (game_id)
      heavy: cleanId(o.heavy),
      medium: cleanId(o.medium),
      filler1: cleanId(o.filler1),
      filler2: cleanId(o.filler2),
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
      start_time: cleanId(o.start_time),
      p1: cleanId(o.p1),
      p2: cleanId(o.p2),
      p3: cleanId(o.p3),
      p4: cleanId(o.p4),
      p5: cleanId(o.p5),
    }))
    .filter((m) => m.session_date && m.game_id);
}
