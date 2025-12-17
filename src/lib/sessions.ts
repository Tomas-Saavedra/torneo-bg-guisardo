// src/lib/sessions.ts
import type { GameRow, MatchRow, PlayerRow, ScheduleRow } from "./sheets";
import { computeMatchPoints, getMatchPlacements } from "./league";

export type SessionResultRow = {
  place: number; // 1..n
  label: string; // "Ganador", "Segundo", ...
  player_id: string;
  player_name: string;
  points: number;
};

export type SessionView = {
  session_date: string; // "YYYY-MM-DD"
  start_time: string; // "HH:MM"
  game_id: string;
  game_name: string;
  results: SessionResultRow[];
};

const PLACE_LABELS = [
  "Ganador",
  "Segundo",
  "Tercero",
  "4° puesto",
  "5° puesto",
];

function s(v: unknown): string {
  return v === null || v === undefined ? "" : String(v).trim();
}

export function buildSessionsForDate(args: {
  date: string; // "YYYY-MM-DD"
  players: PlayerRow[];
  games: GameRow[];
  matches: MatchRow[];
  schedule?: ScheduleRow[]; // opcional, por si querés mostrar datos de la jornada
}): { sessions: SessionView[]; jornada?: ScheduleRow } {
  const date = s(args.date);

  const playerNameById = new Map<string, string>();
  for (const p of args.players) playerNameById.set(s(p.player_id), s(p.name || p.player_id));

  const gameById = new Map<string, GameRow>();
  for (const g of args.games) gameById.set(s(g.game_id), g);

  const jornada = args.schedule?.find((j) => s(j.date) === date);

  const sessions: SessionView[] = args.matches
    .filter((m) => s(m.session_date) === date)
    .map((m) => {
      const gameId = s(m.game_id);
      const game = gameById.get(gameId);
      const gameName = s(game?.name) || gameId || "(sin juego)";

      const placements = getMatchPlacements(m);
      const pts = computeMatchPoints(m, game);

      const results: SessionResultRow[] = placements.map((pid, idx) => {
        const place = idx + 1;
        const label = PLACE_LABELS[idx] ?? `${place}° puesto`;
        const player_name = playerNameById.get(pid) ?? pid;
        const points = pts.get(pid) ?? 0;
        return { place, label, player_id: pid, player_name, points };
      });

      return {
        session_date: s(m.session_date),
        start_time: s(m.start_time),
        game_id: gameId,
        game_name: gameName,
        results,
      };
    })
    // orden por hora
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return { sessions, jornada };
}
