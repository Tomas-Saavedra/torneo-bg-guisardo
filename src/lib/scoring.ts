// src/lib/scoring.ts

export const BASE_POINTS_BY_PLACE = [5, 3, 1.5, 0.5, 0] as const;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * participants: en orden de llegada (p1=ganador, p2=2do, etc.)
 * multiplier: del juego (ej: heavy=2, medium=1.5, filler=1)
 */
export function calcMatchPoints(
  participants: string[],
  multiplier: number = 1
): Record<string, number> {
  const mult = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;

  const out: Record<string, number> = {};
  for (let i = 0; i < participants.length; i++) {
    const p = (participants[i] ?? "").trim();
    if (!p) continue;

    const base = BASE_POINTS_BY_PLACE[i] ?? 0;
    const pts = round2(base * mult);
    out[p] = (out[p] ?? 0) + pts;
  }
  return out;
}

export function pointsForPlace(placeIndex: number, multiplier: number = 1): number {
  const mult = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
  const base = BASE_POINTS_BY_PLACE[placeIndex] ?? 0;
  return round2(base * mult);
}
