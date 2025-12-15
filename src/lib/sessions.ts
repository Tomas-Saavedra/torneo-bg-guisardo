import type { Game, Match, Player } from "./sheets";
import { calcMatchPoints } from "./scoring";

export type MatchView = {
  session_date: string;
  start_time: string;
  game_id: string;
  game_name: string;
  multiplier: number;
  placements: { player_id: string; name: string; place: number; points: number }[];
};

export type SessionView = {
  session_date: string;
  matches: MatchView[];
};

export function buildSessions(players: Player[], games: Game[], matches: Match[]): SessionView[] {
  const playerById = new Map(players.map((p) => [p.player_id, p]));
  const gameById = new Map(games.map((g) => [g.game_id, g]));

  const byDate = new Map<string, MatchView[]>();

  for (const m of matches) {
    const g = gameById.get(m.game_id);
    if (!g) continue;

    const ptsByPlayer = calcMatchPoints(m.placements, g.multiplier);

    const placements = m.placements.map((pid, idx) => {
      const p = playerById.get(pid);
      return {
        player_id: pid,
        name: p?.name ?? pid,
        place: idx + 1,
        points: ptsByPlayer[pid] ?? 0,
      };
    });

    const mv: MatchView = {
      session_date: m.session_date,
      start_time: m.start_time,
      game_id: m.game_id,
      game_name: g.name,
      multiplier: g.multiplier,
      placements,
    };

    if (!byDate.has(m.session_date)) byDate.set(m.session_date, []);
    byDate.get(m.session_date)!.push(mv);
  }

  // Ordenar partidas por horario dentro de la jornada
  const sessions: SessionView[] = Array.from(byDate.entries())
    .map(([date, ms]) => ({
      session_date: date,
      matches: [...ms].sort((a, b) => a.start_time.localeCompare(b.start_time)),
    }))
    .sort((a, b) => b.session_date.localeCompare(a.session_date)); // más nuevas arriba

  return sessions;
}

export function sessionTotals(session: SessionView) {
  const totals = new Map<string, { name: string; points: number; wins: number }>();

  for (const match of session.matches) {
    const winner = match.placements[0]?.player_id;
    for (const pl of match.placements) {
      const cur = totals.get(pl.player_id) ?? { name: pl.name, points: 0, wins: 0 };
      cur.points += pl.points;
      if (winner && pl.player_id === winner) cur.wins += 1;
      totals.set(pl.player_id, cur);
    }
  }

  const arr = Array.from(totals.entries()).map(([player_id, v]) => ({
    player_id,
    name: v.name,
    points: v.points,
    wins: v.wins,
  }));

  arr.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.name.localeCompare(b.name);
  });

  return arr;
}
