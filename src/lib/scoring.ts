// src/lib/scoring.ts

/**
 * Base de puntos por puesto (ANTES del multiplicador del juego).
 * Esto define el “filler”.
 *
 * - filler (x1): 1° 5, 2° 3, 3° 1.5, 4° 0.5
 * - medium (x1.5): 7.5, 4.5, 2.25, 0.75
 * - heavy (x2): 10, 6, 3, 1
 */
export const BASE_POINTS_BY_PLACE = [5, 3, 1.5, 0.5, 0] as const;

function roundPts(n: number): number {
  // evita floats feos
  return Math.round(n * 100) / 100;
}

/**
 * Calcula puntos por jugador usando:
 * - el orden de `participants` como el puesto (p1=ganador, p2=2do, etc.)
 * - multiplicador del juego (columna "multiplier")
 *
 * Devuelve: { [playerIdOrName]: points }
 */
export function calcMatchPoints(
  participants: string[],
  multiplier: number = 1
): Record<string, number> {
  const mult = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;

  const out: Record<string, number> = {};

  for (let idx = 0; idx < participants.length; idx++) {
    const p = (participants[idx] ?? "").trim();
    if (!p) continue;

    const base = BASE_POINTS_BY_PLACE[idx] ?? 0;
    const pts = roundPts(base * mult);

    out[p] = roundPts((out[p] ?? 0) + pts);
  }

  return out;
}
