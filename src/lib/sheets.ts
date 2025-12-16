import { parseCsv } from "./csv";

export type Player = {
  id: string;
  name: string;
};

export type Game = {
  id: string;
  name: string;
  weight?: string;
  image_url?: string;
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

async function fetchCsv(envName: string): Promise<Record<string, string>[]> {
  const url = process.env[envName];

  // Guardrail absoluto: nunca rompe runtime
  if (!url || typeof url !== "string") {
    console.error(`❌ Missing env var: ${envName}`);
    return [];
  }

  try {
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      console.error(`❌ Fetch failed for ${envName}: ${res.status}`);
      return [];
    }

    const text = await res.text();
    return parseCsv(text);
  } catch (err) {
    console.error(`❌ Error fetching ${envName}`, err);
    return [];
  }
}

export async function loadPlayers(): Promise<Player[]> {
  return (await fetchCsv("SHEETS_PLAYERS_CSV_URL")) as unknown as Player[];
}

export async function loadGames(): Promise<Game[]> {
  return (await fetchCsv("SHEETS_GAMES_CSV_URL")) as unknown as Game[];
}

export async function loadSchedule(): Promise<ScheduleRow[]> {
  return (await fetchCsv("SHEETS_SCHEDULE_CSV_URL")) as unknown as ScheduleRow[];
}

export async function loadMatches(): Promise<MatchRow[]> {
  return (await fetchCsv("SHEETS_MATCHES_CSV_URL")) as unknown as MatchRow[];
}
