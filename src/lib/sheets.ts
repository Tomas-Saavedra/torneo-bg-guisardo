import { parseCsv } from "./csv";

export type Player = { player_id: string; name: string };

export type Game = {
  game_id: string;
  name: string;
  type: string;
  multiplier: number;
  min_p: number;
  max_p: number;
  image_url?: string;
};

export type ScheduleItem = {
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  notes: string;
};

export type Match = {
  session_date: string;
  game_id: string;
  start_time: string;
  placements: string[];
};

async function fetchCsv(url: string) {
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`CSV fetch failed: ${res.status} (${url})`);
  return res.text();
}

export async function loadPlayers(): Promise<Player[]> {
  const text = await fetchCsv(process.env.SHEETS_PLAYERS_CSV_URL!);
  return parseCsv(text).map((r) => ({
    player_id: (r.player_id || "").trim().toLowerCase(),
    name: (r.name || "").trim(),
  }));
}

export async function loadGames(): Promise<Game[]> {
  const text = await fetchCsv(process.env.SHEETS_GAMES_CSV_URL!);
  return parseCsv(text).map((r) => ({
    game_id: (r.game_id || "").trim().toLowerCase(),
    name: (r.name || "").trim(),
    type: (r.type || "").trim().toLowerCase(),
    multiplier: Number((r.multiplier || "1").trim()),
    min_p: Number((r.min_p || "0").trim()),
    max_p: Number((r.max_p || "0").trim()),
    image_url: (r.image_url || "").trim(),
  }));
}

export async function loadSchedule(): Promise<ScheduleItem[]> {
  const text = await fetchCsv(process.env.SHEETS_SCHEDULE_CSV_URL!);
  return parseCsv(text).map((r) => ({
    date: (r.date || "").trim(),
    start_time: (r.start_time || "").trim(),
    end_time: (r.end_time || "").trim(),
    location: (r.location || "").trim(),
    notes: (r.notes || "").trim(),
  }));
}

export async function loadMatches(): Promise<Match[]> {
  const text = await fetchCsv(process.env.SHEETS_MATCHES_CSV_URL!);
  return parseCsv(text).map((r) => {
    const placements = [r.p1, r.p2, r.p3, r.p4, r.p5]
      .filter(Boolean)
      .map((x) => (x || "").trim().toLowerCase());

    return {
      session_date: (r.session_date || "").trim(),
      game_id: (r.game_id || "").trim().toLowerCase(),
      start_time: (r.start_time || "").trim(),
      placements,
    };
  });
}
