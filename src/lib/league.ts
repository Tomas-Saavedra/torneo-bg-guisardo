// src/lib/league.ts
import { calcMatchPoints } from "./scoring";
import type { Game, MatchRow, Player } from "./sheets";

export type PlayerStats = {
  player_id: string;
  name: string;
  matches: number;
  wins: number;
  points: number;
};

function s(v: unknown): string {
  return v === null || v === undefined ? "" : String(v).trim();
}
function num(v: unknown, fallback = 0): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

export function computeLeaderboard(
  players: Player[],
  games: Game[],
  matches: MatchRow[],
  minMatches = 10
) {
  const playerName = new Map(players.map((p) => [p.id, p.name || p.id]));
  const gameById = new Map(games.map((g) => [g.game_id, g]));

  const statsById = new Map<string, PlayerStats>();
  for (const p of players) {
    statsById.set(p.id, {
      player_id: p.id,
      name: p.name || p.id,
      matches: 0,
      wins: 0,
      points: 0,
    });
  }

  for (const m of matches) {
    const participants = [m.p1, m.p2, m.p3, m.p4, m.p5].map(s).filter(Boolean);
    if (participants.length === 0) continue;

    const g = gameById.get(s(m.game_id));
    const multiplier = g?.multiplier ?? 1;

    // calcMatchPoints espera: (orderedPlayerIds, multiplier)
    const raw = calcMatchPoints(participants, multiplier) as Record<string, number>;

    // winner = max points
    let winnerId: string | null = null;
    let best = -Infinity;

    for (const pid of participants) {
      if (!statsById.has(pid)) {
        statsById.set(pid, {
          player_id: pid,
          name: playerName.get(pid) || pid,
          matches: 0,
          wins: 0,
          points: 0,
        });
      }

      const st = statsById.get(pid)!;
      st.matches += 1;

      const pts = num(raw[pid], 0);
      st.points += pts;

      if (pts > best) {
        best = pts;
        winnerId = pid;
      }
    }

    if (winnerId) {
      const st = statsById.get(winnerId);
      if (st) st.wins += 1;
    }
  }

  const all = Array.from(statsById.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.matches - a.matches;
  });

  const eligible = all.filter((x) => x.matches >= minMatches);

  return { eligible, all, minMatches };
}
