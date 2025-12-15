import { calcMatchPoints } from "./scoring";
import type { Game, Match, Player } from "./sheets";

export type PlayerStats = {
  player_id: string;
  name: string;
  matches: number;
  points: number;
  rating: number;
  heavyWins: number;
};

export function computeLeaderboard(
  players: Player[],
  games: Game[],
  matches: Match[],
  minMatches = 10
) {
  const gameById = new Map(games.map((g) => [g.game_id, g]));
  const stats = new Map<string, PlayerStats>();

  for (const p of players) {
    stats.set(p.player_id, {
      player_id: p.player_id,
      name: p.name,
      matches: 0,
      points: 0,
      rating: 0,
      heavyWins: 0,
    });
  }

  for (const m of matches) {
    const g = gameById.get(m.game_id);
    if (!g) continue;

    const pts = calcMatchPoints(m.placements, g.multiplier);

    for (const [pid, pPoints] of Object.entries(pts)) {
      const s = stats.get(pid);
      if (!s) continue;
      s.matches += 1;
      s.points += pPoints;
    }

    if (g.type === "heavy" && m.placements[0]) {
      const winner = stats.get(m.placements[0]);
      if (winner) winner.heavyWins += 1;
    }
  }

  for (const s of stats.values()) {
    s.rating = s.matches > 0 ? s.points / s.matches : 0;
  }

  const all = Array.from(stats.values());
  const eligible = all.filter((s) => s.matches >= minMatches);

  eligible.sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.heavyWins !== a.heavyWins) return b.heavyWins - a.heavyWins;
    return b.matches - a.matches;
  });

  return { eligible, all, minMatches };
}
