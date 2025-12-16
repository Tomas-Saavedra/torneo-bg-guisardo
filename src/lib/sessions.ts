// src/lib/sessions.ts
import type { Game, MatchRow, Player } from "./sheets";
import { calcMatchPoints } from "./scoring";

/**
 * Vista normalizada de una partida
 * (para jornadas / sesiones)
 */
export type MatchView = {
  game: string;
  gameId: number;
  players: string[];
  points: Record<string, number>;
  winner: string | null;
};

function safeStr(v: unknown): string {
  return v === null || v === undefined ? "" : String(v).trim();
}

function toNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Construye las partidas agrupadas por fecha (jornadas)
 */
export function buildSessions(args: {
  players: Player[];
  games: Game[];
  matches: MatchRow[];
}) {
  const { players, games, matches } = args;

  const playerNameById = new Map<string, string>();
  for (const p of players) {
    const id = safeStr((p as any).id);
    const name = safeStr((p as any).name);
    if (id) playerNameById.set(id, name || id);
  }

  const gameNameById = new Map<number, string>();
  for (const g of games) {
    const id = toNumber((g as any).id ?? (g as any).session);
    const name = safeStr((g as any).game);
    if (id) gameNameById.set(id, name || `Juego ${id}`);
  }

  // Agrupar por fecha
  const sessions = new Map<string, MatchView[]>();

  for (const m of matches) {
    const date = safeStr(m.session_date);
    if (!date) continue;

    const participants = [m.p1, m.p2, m.p3, m.p4, m.p5]
      .map(safeStr)
      .filter(Boolean);

    if (!participants.length) continue;

    const gameId = toNumber(m.game_id);
    const gameName = gameNameById.get(gameId) ?? `Juego ${gameId}`;

    const rawPoints = calcMatchPoints(participants, gameId);

    const points: Record<string, number> = {};
    let maxPts = -Infinity;
    let winner: string | null = null;

    for (const p of participants) {
      const pid = safeStr(p);
      const display = playerNameById.get(pid) || pid;
      const pts = toNumber((rawPoints as any)[pid] ?? (rawPoints as any)[p] ?? 0);

      points[display] = pts;

      if (pts > maxPts) {
        maxPts = pts;
        winner = display;
      }
    }

    const view: MatchView = {
      game: gameName,
      gameId,
      players: participants.map(p => playerNameById.get(p) || p),
      points,
      winner,
    };

    if (!sessions.has(date)) sessions.set(date, []);
    sessions.get(date)!.push(view);
  }

  // Ordenamos fechas
  return Array.from(sessions.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, matches]) => ({
      date,
      matches,
    }));
}
