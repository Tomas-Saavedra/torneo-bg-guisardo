// src/lib/sessions.ts
import type { Game, Match, ScheduleRow } from "./sheets";
import { calcMatchPoints } from "./scoring";

export type SessionView = {
  session_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  game_id: string;
  gameName: string;

  placements: string[]; // en orden (ganador -> ...)
  pointsByPlayer: Record<string, number>; // ya con multiplicador aplicado
  multiplier: number;
};

export function safeStr(v: unknown): string {
  return String(v ?? "").trim();
}

export function normalizeDate(v: unknown): string {
  const s = safeStr(v);
  // dejamos YYYY-MM-DD tal cual; si viene con hora, cortamos.
  if (s.includes("T")) return s.split("T")[0]!;
  if (s.includes(" ")) return s.split(" ")[0]!;
  return s;
}

export function getPlacements(match: Match): string[] {
  const raw = [match.p1, match.p2, match.p3, match.p4, match.p5]
    .map((x) => safeStr(x))
    .filter(Boolean);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of raw) {
    if (!seen.has(p)) {
      seen.add(p);
      out.push(p);
    }
  }
  return out;
}

export function gameMultiplier(game?: Game): number {
  const m = Number(game?.multiplier ?? 1);
  return Number.isFinite(m) && m > 0 ? m : 1;
}

export function buildSessions(games: Game[], matches: Match[]): SessionView[] {
  const gameById = new Map<string, Game>();
  for (const g of games) gameById.set(safeStr(g.game_id), g);

  return matches.map((m) => {
    const gid = safeStr(m.game_id);
    const g = gameById.get(gid);

    const mult = gameMultiplier(g);
    const placements = getPlacements(m);
    const pointsByPlayer = calcMatchPoints(placements, mult);

    return {
      session_date: normalizeDate(m.session_date),
      start_time: safeStr(m.start_time),
      game_id: gid,
      gameName: safeStr(g?.name ?? gid),
      placements,
      pointsByPlayer,
      multiplier: mult,
    };
  });
}

export function sessionsForDate(date: string, games: Game[], matches: Match[]): SessionView[] {
  const d = normalizeDate(date);
  return buildSessions(games, matches)
    .filter((s) => s.session_date === d)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
}

export function scheduleForDate(date: string, schedule: ScheduleRow[]): ScheduleRow | undefined {
  const d = normalizeDate(date);
  return schedule.find((s) => normalizeDate(s.date) === d);
}
