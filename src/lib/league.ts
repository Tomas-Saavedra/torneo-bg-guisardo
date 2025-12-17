// src/lib/league.ts

import { calcMatchPoints } from "./scoring";

export type PlayerRow = {
  player_id: string;
  name?: string;
};

export type GameRow = {
  game_id: string;
  name?: string;
  multiplier?: number | string;
  type?: string;
  min_p?: number | string;
  max_p?: number | string;
  image_url?: string;
};

export type MatchRow = {
  session_date?: string;
  game_id?: string;
  start_time?: string;
  p1?: string;
  p2?: string;
  p3?: string;
  p4?: string;
  p5?: string;
};

export type PlayerStats = {
  player_id: string;
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

function toNum(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(String(v ?? "").trim());
  return Number.isFinite(n) ? n : fallback;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function normId(v: unknown): string {
  return String(v ?? "").trim();
}

/** p1=ganador, p2=2do, etc. */
export function getMatchPlacements(match: MatchRow): string[] {
  const raw = [match.p1, match.p2, match.p3, match.p4, match.p5]
    .map((x) => normId(x))
    .filter(Boolean);

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const p of raw) {
    if (!seen.has(p)) {
      seen.add(p);
      unique.push(p);
    }
  }
  return unique;
}

export function getGameMultiplier(game?: GameRow): number {
  const m = toNum(game?.multiplier, 1);
  return Number.isFinite(m) && m > 0 ? m : 1;
}

export function computeLeaderboard(args: {
  players: PlayerRow[];
  games: GameRow[];
  matches: MatchRow[];
  minMatches?: number;
}): LeaderboardResult {
  const { players, games, matches } = args;
  const minMatches = Math.max(0, args.minMatches ?? 1);

  const gameById = new Map<string, GameRow>();
  for (const g of games) gameById.set(normId(g.game_id), g);

  const playerNameById = new Map<string, string>();
  for (const p of players) {
    const id = normId(p.player_id);
    playerNameById.set(id, normId(p.name) || id);
  }

  const statsByPlayer = new Map<string, PlayerStats>();
  for (const p of players) {
    const id = normId(p.player_id);
    statsByPlayer.set(id, {
      player_id: id,
      name: playerNameById.get(id) ?? id,
      matches: 0,
      wins: 0,
      podiums: 0,
      points: 0,
      avgPoints: 0,
    });
  }

  for (const m of matches) {
    const placements = getMatchPlacements(m);
    if (placements.length === 0) continue;

    const game = gameById.get(normId(m.game_id));
    const mult = getGameMultiplier(game);

    const ptsByPlayer = calcMatchPoints(placements, mult);

    for (let i = 0; i < placements.length; i++) {
      const pid = placements[i];

      if (!statsByPlayer.has(pid)) {
        statsByPlayer.set(pid, {
          player_id: pid,
          name: playerNameById.get(pid) ?? pid,
          matches: 0,
          wins: 0,
          podiums: 0,
          points: 0,
          avgPoints: 0,
        });
      }

      const st = statsByPlayer.get(pid)!;
      st.matches += 1;
      if (i === 0) st.wins += 1;
      if (i <= 2) st.podiums += 1;
      st.points = round2(st.points + (ptsByPlayer[pid] ?? 0));
    }
  }

  const all: PlayerStats[] = Array.from(statsByPlayer.values()).map((s) => {
    const avg = s.matches > 0 ? s.points / s.matches : 0;
    return { ...s, avgPoints: round2(avg) };
  });

  all.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.matches !== a.matches) return b.matches - a.matches;
    return a.name.localeCompare(b.name);
  });

  const eligible = all.filter((p) => p.matches >= minMatches);

  return { eligible, all, minMatches };
}
