// src/lib/sessions.ts
import type { Game, MatchRow, ScheduleRow } from "./sheets";
import { calcMatchPoints, getPlacementsFromMatch } from "./scoring";

export type SessionMatchView = {
  id: string;
  session_date: string;
  start_time?: string;

  game_id: string;
  game_name: string;
  multiplier: number;

  placements: string[]; // en orden (ganador, 2do, etc)
  pointsByPlayer: Record<string, number>;
};

function normDate(d: string): string {
  return String(d ?? "").trim();
}

function toNum(v: unknown, fallback = 1): number {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function buildMatchesForDate(args: {
  date: string;
  matches: MatchRow[];
  games: Game[];
}): SessionMatchView[] {
  const date = normDate(args.date);
  const { matches, games } = args;

  const gameById = new Map<string, Game>();
  for (const g of games) gameById.set(String(g.game_id).trim(), g);

  const filtered = matches.filter((m) => normDate(m.session_date) === date);

  const out: SessionMatchView[] = filtered.map((m, idx) => {
    const gid = String(m.game_id ?? "").trim();
    const g = gameById.get(gid);

    const game_name = String(g?.name ?? gid).trim();
    const mult = toNum(g?.multiplier, 1);

    const placements = getPlacementsFromMatch(m);
    const pointsByPlayer = calcMatchPoints(placements, mult);

    return {
      id: `${date}-${gid}-${m.start_time ?? ""}-${idx}`,
      session_date: date,
      start_time: m.start_time,

      game_id: gid,
      game_name,
      multiplier: mult,

      placements,
      pointsByPlayer,
    };
  });

  // ordenar por start_time si existe
  out.sort((a, b) => String(a.start_time ?? "").localeCompare(String(b.start_time ?? "")));

  return out;
}

export function findScheduleForDate(schedule: ScheduleRow[], date: string): ScheduleRow | undefined {
  const d = normDate(date);
  return schedule.find((s) => normDate(s.date) === d);
}
