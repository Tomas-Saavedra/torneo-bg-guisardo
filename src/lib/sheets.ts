// src/lib/sheets.ts
import { parseCsv } from "./csv";

function s(v: unknown): string {
  return v === null || v === undefined ? "" : String(v).trim();
}
function n(v: unknown, fallback = 0): number {
  const x = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(x) ? x : fallback;
}
function i(v: unknown, fallback?: number): number | undefined {
  const x = Number.parseInt(String(v ?? ""), 10);
  return Number.isFinite(x) ? x : fallback;
}

/**
 * Lee CSV desde una URL (env var) y devuelve rows como objetos por header.
 * Usa parseCsv() que ya existe en tu proyecto.
 */
async function loadCsvRows(envKey: string): Promise<Record<string, string>[]> {
  const url = process.env[envKey];
  if (!url) {
    console.warn(`[sheets] Missing env var ${envKey}. Returning empty dataset.`);
    return [];
  }

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    console.warn(`[sheets] Failed to fetch ${envKey} (${res.status}). Returning empty dataset.`);
    return [];
  }

  const text = await res.text();

  // parseCsv debería devolverte algo tipo { headers, rows } o directamente rows.
  // Normalizamos ambos casos.
  const parsed: any = parseCsv(text);

  // Caso A: parseCsv devuelve array de rows
  if (Array.isArray(parsed)) return parsed as Record<string, string>[];

  // Caso B: parseCsv devuelve objeto con .rows
  if (parsed && Array.isArray(parsed.rows)) return parsed.rows as Record<string, string>[];

  // Fallback
  return [];
}

/** Players sheet */
export type Player = {
  id: string;
  name: string;
};

/** Games sheet */
export type Game = {
  game_id: string;
  id: string; // alias
  name: string;
  type?: string;
  multiplier: number;
  min_p?: number;
  max_p?: number;
  image_url?: string;
};

/** Schedules sheet */
export type ScheduleRow = {
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  notes?: string;
};

/** Matches sheet */
export type MatchRow = {
  session_date: string;
  game_id: string;
  start_time?: string;
  p1?: string;
  p2?: string;
  p3?: string;
  p4?: string;
  p5?: string;
};

export async function loadPlayers(): Promise<Player[]> {
  const rows = await loadCsvRows("SHEETS_PLAYERS_CSV_URL");

  return rows
    .map((r) => {
      const id = s((r as any).player_id ?? (r as any).id ?? (r as any).handle ?? (r as any).username ?? (r as any).name);
      const name = s((r as any).name ?? (r as any).display_name ?? (r as any).player_name ?? id);
      return { id, name };
    })
    .filter((p) => p.id.length > 0);
}

export async function loadGames(): Promise<Game[]> {
  const rows = await loadCsvRows("SHEETS_GAMES_CSV_URL");

  return rows
    .map((r) => {
      const game_id = s((r as any).game_id ?? (r as any).id);
      const name = s((r as any).name);
      const type = s((r as any).type) || undefined;

      const multiplier = n((r as any).multiplier, 1);
      const min_p = i((r as any).min_p);
      const max_p = i((r as any).max_p);

      const image_url = s((r as any).image_url) || undefined;

      return {
        game_id,
        id: game_id,
        name,
        type,
        multiplier,
        min_p,
        max_p,
        image_url,
      } satisfies Game;
    })
    .filter((g) => g.game_id.length > 0 && g.name.length > 0);
}

export async function loadSchedule(): Promise<ScheduleRow[]> {
  const rows = await loadCsvRows("SHEETS_SCHEDULE_CSV_URL");

  return rows
    .map((r) => ({
      date: s((r as any).date),
      start_time: s((r as any).start_time) || undefined,
      end_time: s((r as any).end_time) || undefined,
      location: s((r as any).location) || undefined,
      notes: s((r as any).notes) || undefined,
    }))
    .filter((x) => x.date.length > 0);
}

export async function loadMatches(): Promise<MatchRow[]> {
  const rows = await loadCsvRows("SHEETS_MATCHES_CSV_URL");

  return rows
    .map((r) => ({
      session_date: s((r as any).session_date),
      game_id: s((r as any).game_id),
      start_time: s((r as any).start_time) || undefined,
      p1: s((r as any).p1) || undefined,
      p2: s((r as any).p2) || undefined,
      p3: s((r as any).p3) || undefined,
      p4: s((r as any).p4) || undefined,
      p5: s((r as any).p5) || undefined,
    }))
    .filter((m) => m.session_date.length > 0 && m.game_id.length > 0);
}
