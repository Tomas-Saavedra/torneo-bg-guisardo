// src/lib/sheets.ts

import { parseCsv } from "./csv";

function s(v: unknown): string {
  return v === null || v === undefined ? "" : String(v).trim();
}

function n(v: unknown, fallback = 0): number {
  const raw = s(v);
  if (!raw) return fallback;
  const num = Number(raw.replace(",", "."));
  return Number.isFinite(num) ? num : fallback;
}

function normalizeDate(v: unknown): string {
  const raw = s(v);
  if (!raw) return "";

  // ISO (YYYY-MM-DD) o ISO datetime
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  // DD/MM/YYYY o DD-MM-YYYY
  const dmy = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const dd = String(dmy[1]).padStart(2, "0");
    const mm = String(dmy[2]).padStart(2, "0");
    const yyyy = dmy[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  // fallback: devolvemos lo que haya (mejor que romper)
  return raw;
}

async function fetchCsvRows(url: string): Promise<Record<string, string>[]> {
  const u = s(url);
  if (!u) return [];
  const res = await fetch(u, { cache: "no-store" });
  if (!res.ok) return [];
  const text = await res.text();
  const rows = parseCsv(text) as Record<string, unknown>[];
  return (rows ?? []).map((r) => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(r ?? {})) out[String(k).trim()] = s(v);
    return out;
  });
}

export type PlayerRow = {
  player_id: string;
  name: string;
};

export type GameRow = {
  game_id: string;
  name: string;
  type: string; // "heavy" | "medium" | "filler" | ...
  multiplier: number; // 2 | 1.5 | 1 ...
  image?: string;
};

export type ScheduleRow = {
  date: string; // YYYY-MM-DD
  label?: string;
  notes?: string;
};

export type MatchRow = {
  session_date: string; // YYYY-MM-DD
  game_id: string;

  p1?: string;
  p2?: string;
  p3?: string;
  p4?: string;
  p5?: string;

  notes?: string;
};

function env(name: string): string {
  return s(process.env[name]);
}

export async function loadPlayers(): Promise<PlayerRow[]> {
  const rows = await fetchCsvRows(env("SHEETS_PLAYERS_CSV_URL"));

  const out: PlayerRow[] = [];
  for (const r of rows) {
    const player_id = s(r.player_id || r.id || r.player || r.name);
    const name = s(r.name || r.player_name || r.player || r.id || r.player_id);
    if (!player_id) continue;
    out.push({ player_id, name: name || player_id });
  }

  // de-dupe por player_id
  const seen = new Set<string>();
  return out.filter((p) => (seen.has(p.player_id) ? false : (seen.add(p.player_id), true)));
}

export async function loadGames(): Promise<GameRow[]> {
  const rows = await fetchCsvRows(env("SHEETS_GAMES_CSV_URL"));

  const out: GameRow[] = [];
  for (const r of rows) {
    const game_id = s(r.game_id || r.id);
    const name = s(r.name || r.game || r.title);
    if (!game_id || !name) continue;

    const type = s(r.type || r.category || "").toLowerCase();
    let multiplier = n(r.multiplier, 0);

    if (!multiplier) {
      // si no viene multiplier, inferimos por type
      if (type === "heavy") multiplier = 2;
      else if (type === "medium") multiplier = 1.5;
      else if (type === "filler") multiplier = 1;
      else multiplier = 1;
    }

    const image = s(r.image || r.img || r.image_url || "");

    out.push({
      game_id,
      name,
      type: type || "filler",
      multiplier,
      ...(image ? { image } : {}),
    });
  }

  // de-dupe por game_id
  const seen = new Set<string>();
  return out.filter((g) => (seen.has(g.game_id) ? false : (seen.add(g.game_id), true)));
}

export async function loadSchedule(): Promise<ScheduleRow[]> {
  const rows = await fetchCsvRows(env("SHEETS_SCHEDULE_CSV_URL"));

  const out: ScheduleRow[] = [];
  for (const r of rows) {
    const date = normalizeDate(r.date || r.session_date || r.day);
    if (!date) continue;

    const label = s(r.label || r.title || "");
    const notes = s(r.notes || r.note || "");

    out.push({
      date,
      ...(label ? { label } : {}),
      ...(notes ? { notes } : {}),
    });
  }

  // orden por fecha
  out.sort((a, b) => a.date.localeCompare(b.date));

  // de-dupe por date
  const seen = new Set<string>();
  return out.filter((x) => (seen.has(x.date) ? false : (seen.add(x.date), true)));
}

export async function loadMatches(): Promise<MatchRow[]> {
  const rows = await fetchCsvRows(env("SHEETS_MATCHES_CSV_URL"));

  const out: MatchRow[] = [];
  for (const r of rows) {
    const session_date = normalizeDate(r.session_date || r.date || r.day);
    const game_id = s(r.game_id || r.game || r.gameId || r.id);

    if (!session_date || !game_id) continue;

    const p1 = s(r.p1 || r.winner || r.first);
    const p2 = s(r.p2 || r.second);
    const p3 = s(r.p3 || r.third);
    const p4 = s(r.p4 || r.fourth);
    const p5 = s(r.p5 || r.fifth);
    const notes = s(r.notes || r.note || "");

    out.push({
      session_date,
      game_id,
      ...(p1 ? { p1 } : {}),
      ...(p2 ? { p2 } : {}),
      ...(p3 ? { p3 } : {}),
      ...(p4 ? { p4 } : {}),
      ...(p5 ? { p5 } : {}),
      ...(notes ? { notes } : {}),
    });
  }

  return out;
}
