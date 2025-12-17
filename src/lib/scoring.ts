// src/lib/scoring.ts

// Base “real” por puesto. Luego se multiplica por game.multiplier.
// (heavy=2 => 20/12/6/2, medium=1.5 => 15/9/4.5/1.5, filler=1 => 10/6/3/1)
const BASE_POINTS_BY_PLACE = [10, 6, 3, 1, 0] as const;

export function pointsForPlace(placeIndex: number, multiplier = 1): number {
  const base = BASE_POINTS_BY_PLACE[placeIndex] ?? 0;
  const mult = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;

  const raw = base * mult;

  // redondeo “limpio” a 2 decimales por si hay 1.5 y similares
  return Math.round(raw * 100) / 100;
}

export function getPlacementsFromMatch(match: {
  p1?: string;
  p2?: string;
  p3?: string;
  p4?: string;
  p5?: string;
}): string[] {
  const raw = [match.p1, match.p2, match.p3, match.p4, match.p5]
    .map((x) => String(x ?? "").trim())
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

export function calcMatchPoints(
  participantsInOrder: string[],
  multiplier = 1
): Record<string, number> {
  const out: Record<string, number> = {};

  for (let i = 0; i < participantsInOrder.length; i++) {
    const name = String(participantsInOrder[i] ?? "").trim();
    if (!name) continue;

    const pts = pointsForPlace(i, multiplier);
    out[name] = (out[name] ?? 0) + pts;
  }

  return out;
}
