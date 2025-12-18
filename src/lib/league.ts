// src/lib/league.ts

import type { Game, MatchRow, Player } from "./sheets";
import { calcMatchPoints, getPlacementsFromMatch } from "./scoring";

export type PlayerStats = {
  id: string;
  name: string;

  matches: number;
  wins: number;
  podiums: number; // top 3
  points: number;

  avgPoints: number;
};

export type LeaderboardResult = {
  eligible: PlayerStats[];
  all: PlayerStats[];
  minMatches: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function toNum(v: unknown, fallback = 1): number {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function computeLeaderboard(args: {
  players: Player[];
  games: Game[];
  matches: MatchRow[];
  minMatches?: number;
}): LeaderboardResult {
  const { players, games, matches } = args;
  const minMatches = Math.max(0, args.minMatches ?? 1);

  const gameById = new Map<string, Game>();
  for (const g of games) gameById.set(String(g.game_id).trim(), g);

  const statsById = new Map<string, PlayerStats>();
  for (const p of players) {
    const id = String(p.id).trim();
    statsById.set(id, {
      id,
      name: String(p.name ?? id).trim(),
      matches: 0,
      wins: 0,
      podiums: 0,
      points: 0,
      avgPoints: 0,
    });
  }

  for (const m of matches) {
    const gid = String(m.game_id ?? "").trim();
    const game = gameById.get(gid);
    const mult = toNum(game?.multiplier, 1);

    const placements = getPlacementsFromMatch(m);
    if (placements.length === 0) continue;

    const pts = calcMatchPoints(placements, mult);

    for (let i = 0; i < placements.length; i++) {
      const pid = placements[i];

      if (!statsById.has(pid)) {
        statsById.set(pid, {
          id: pid,
          name: pid,
          matches: 0,
          wins: 0,
          podiums: 0,
          points: 0,
          avgPoints: 0,
        });
      }

      const st = statsById.get(pid)!;
      st.matches += 1;
      if (i === 0) st.wins += 1;
      if (i <= 2) st.podiums += 1;
      st.points = round2(st.points + (pts[pid] ?? 0));
    }
  }

  const all: PlayerStats[] = Array.from(statsById.values()).map((s) => ({
    ...s,
    avgPoints: s.matches > 0 ? round2(s.points / s.matches) : 0,
  }));

  all.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.matches !== a.matches) return b.matches - a.matches;
    return a.name.localeCompare(b.name);
  });

  const eligible = all.filter((p) => p.matches >= minMatches);
  return { eligible, all, minMatches };
}
