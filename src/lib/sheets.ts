// src/lib/sheets.ts

/* =========================
   Tipos base
========================= */

export type PlayerName = string;

export interface Player {
  id: string;
  name: string;
}

export interface Game {
  session: number;
  date: string;
  game: string;
  time?: string;
  p1?: PlayerName;
  p2?: PlayerName;
  p3?: PlayerName;
  p4?: PlayerName;
  p5?: PlayerName;
}

export interface ScheduleRow {
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  notes?: string;
}

export interface MatchRow {
  session_date: string;
  game_id: string;
  start_time?: string;
  p1?: string;
  p2?: string;
  p3?: string;
  p4?: string;
  p5?: string;
}

export interface RankingEntry {
  player: string;
  points: number;
  games: number;
}

/* =========================
   Helpers seguros
========================= */

function s(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function n(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

/* =========================
   CSV Fetcher robusto
========================= */

async function fetchCsv(envVarName: string): Promise<Record<string, string>[]> {
  const url = process.env[envVarName];

  if (!url) {
    console.warn(`⚠️ ENV ${envVarName} no definida`);
    return [];
  }

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    console.error(`❌ Error fetch CSV ${envVarName}`, res.status);
    return [];
  }

  const text = await res.text();
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(h => h.trim());

  return lines.slice(1).map(line => {
    const cols = line.split(",");
    const row: Record<string, string> = {};

    headers.forEach((h, i) => {
      row[h] = cols[i]?.trim() ?? "";
    });

    return row;
  });
}

/* =========================
   Loaders públicos
========================= */

export async function loadPlayers(): Promise<Player[]> {
  const rows = await fetchCsv("SHEETS_PLAYERS_CSV_URL");

  return rows
    .map(r => ({
      id: s(r.id),
      name: s(r.name),
    }))
    .filter(p => p.id && p.name);
}

export async function loadGames(): Promise<Game[]> {
  const rows = await fetchCsv("SHEETS_GAMES_CSV_URL");

  return rows
    .map(r => ({
      session: n(r.session),
      date: s(r.date),
      game: s(r.game),
      time: s(r.time) || undefined,
      p1: s(r.p1) || undefined,
      p2: s(r.p2) || undefined,
      p3: s(r.p3) || undefined,
      p4: s(r.p4) || undefined,
      p5: s(r.p5) || undefined,
    }))
    .filter(g => g.date && g.game);
}

export async function loadSchedule(): Promise<ScheduleRow[]> {
  const rows = await fetchCsv("SHEETS_SCHEDULE_CSV_URL");

  return rows
    .map(r => ({
      date: s(r.date),
      start_time: s(r.start_time) || undefined,
      end_time: s(r.end_time) || undefined,
      location: s(r.location) || undefined,
      notes: s(r.notes) || undefined,
    }))
    .filter(r => r.date);
}

export async function loadMatches(): Promise<MatchRow[]> {
  const rows = await fetchCsv("SHEETS_MATCHES_CSV_URL");

  return rows
    .map(r => ({
      session_date: s(r.session_date),
      game_id: s(r.game_id),
      start_time: s(r.start_time) || undefined,
      p1: s(r.p1) || undefined,
      p2: s(r.p2) || undefined,
      p3: s(r.p3) || undefined,
      p4: s(r.p4) || undefined,
      p5: s(r.p5) || undefined,
    }))
    .filter(m => m.session_date && m.game_id);
}

export async function loadRanking(): Promise<RankingEntry[]> {
  const rows = await fetchCsv("SHEETS_PLAYERS_CSV_URL");

  return rows
    .map(r => ({
      player: s(r.player),
      points: n(r.points),
      games: n(r.games),
    }))
    .filter(r => r.player);
}
