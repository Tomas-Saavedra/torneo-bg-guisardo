import { fetchCsv } from "./csv";

/* ===========================
   TIPOS
=========================== */

export type Game = {
  id: string;
  name: string;
};

export type ScheduleRow = {
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  notes?: string;
};

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

/* ===========================
   HELPERS
=========================== */

function s(v: any): string {
  return typeof v === "string" ? v.trim() : "";
}

/* ===========================
   LOADERS
=========================== */

export async function loadGames(): Promise<Game[]> {
  const rows = await fetchCsv("SHEETS_GAMES_CSV_URL");

  return rows
    .map((r: any) => ({
      id: s(r.id),
      name: s(r.name),
    }))
    .filter(g => g.id.length > 0 && g.name.length > 0);
}

export async function loadSchedule(): Promise<ScheduleRow[]> {
  const rows = await fetchCsv("SHEETS_SCHEDULE_CSV_URL");

  return rows
    .map((r: any) => ({
      date: s(r.date),
      start_time: s(r.start_time) || undefined,
      end_time: s(r.end_time) || undefined,
      location: s(r.location) || undefined,
      notes: s(r.notes) || undefined,
    }))
    .filter(r => r.date.length > 0);
}

export async function loadMatches(): Promise<MatchRow[]> {
  const rows = await fetchCsv("SHEETS_MATCHES_CSV_URL");

  return rows
    .map((r: any) => ({
      session_date: s(r.session_date),
      game_id: s(r.game_id),
      start_time: s(r.start_time) || undefined,
      p1: s(r.p1) || undefined,
      p2: s(r.p2) || undefined,
      p3: s(r.p3) || undefined,
      p4: s(r.p4) || undefined,
      p5: s(r.p5) || undefined,
    }))
    .filter(r => r.session_date.length > 0 && r.game_id.length > 0);
}
