// src/lib/league.ts
import { calcMatchPoints } from "./scoring";
import type { Game, MatchRow, Player } from "./sheets";

export type PlayerStats = {
  player_id: string;
  player_name: string;
  points: number;
  games: number;
  wins: number;
};

function safeStr(v: unknown): string {
  return v === null || v === undefined ? "" : String(v).trim();
}

function toNumber(v: unknown): number {
  const num = Number(v);
  return Number.isFinite(num) ? num : 0;
}

function resolvePlayerId(nameOrId: string): string {
  return safeStr(nameOrId);
}

/**
 * computeLeaderboard: PlayerStats[] ordenado por puntos/wins/games.
 *
 * Firma real de calcMatchPoints:
 *   calcMatchPoints(players: string[], gameId: number)
 */
export function computeLeaderboard(args: {
  players: Player[];
  games: Game[];
  matches: MatchRow[];
}): PlayerStats[] {
  const { players, matches } = args;

  // Map id->name (si existe)
  const playerNameById = new Map<string, string>();
  for (const p of players) {
    const id = safeStr((p as any).id);
    const name = safeStr((p as any).name);
    if (id) playerNameById.set(id, name || id);
  }

  const stats = new Map<string, PlayerStats>();

  for (const m of matches) {
    const participants = [m.p1, m.p2, m.p3, m.p4, m.p5]
      .map((x) => safeStr(x))
      .filter(Boolean);

    if (participants.length === 0) continue;

    // 👇 game_id viene de CSV como string, pero scoring espera number
    const gameIdNum = toNumber(m.game_id);

    const pointsRaw = calcMatchPoints(participants, gameIdNum);

    // Normalizamos a Record<string, number>
    const pointsByPlayer: Record<string, number> = {};

    if (pointsRaw instanceof Map) {
      for (const [k, v] of pointsRaw.entries()) pointsByPlayer[String(k)] = toNumber(v);
    } else if (typeof pointsRaw === "object" && pointsRaw !== null) {
      for (const [k, v] of Object.entries(pointsRaw as any)) pointsByPlayer[String(k)] = toNumber(v);
    } else {
      for (const name of participants) pointsByPlayer[name] = 0;
    }

    // Ganador(es) = max puntos entre participantes
    let maxPts = -Infinity;
    for (const name of participants) {
      const pid = resolvePlayerId(name);
      const pts = toNumber(pointsByPlayer[pid] ?? pointsByPlayer[name] ?? 0);
      if (pts > maxPts) maxPts = pts;
    }

    for (const name of participants) {
      const pid = resolvePlayerId(name);
      const displayName = playerNameById.get(pid) || name || pid;

      const pts = toNumber(pointsByPlayer[pid] ?? pointsByPlayer[name] ?? 0);

      const prev =
        stats.get(pid) ??
        ({
          player_id: pid,
          player_name: displayName,
          points: 0,
          games: 0,
          wins: 0,
        } as PlayerStats);

      prev.points += pts;
      prev.games += 1;
      if (pts === maxPts) prev.wins += 1;
      prev.player_name = displayName;

      stats.set(pid, prev);
    }
  }

  return Array.from(stats.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.games - a.games;
  });
}
