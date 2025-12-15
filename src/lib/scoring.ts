export const BASE_POINTS_5 = [5, 3, 2, 1, 0] as const;
export const BASE_POINTS_4 = [5, 3, 2, 1] as const;
export const BASE_POINTS_3 = [5, 3, 1] as const;

export function basePointsForPlace(numPlayers: number, placeIdx0: number): number {
  if (numPlayers <= 3) return BASE_POINTS_3[placeIdx0] ?? 0;
  if (numPlayers === 4) return BASE_POINTS_4[placeIdx0] ?? 0;
  return BASE_POINTS_5[placeIdx0] ?? 0;
}

export function calcMatchPoints(
  orderedPlayerIds: string[],
  multiplier: number
): Record<string, number> {
  const n = orderedPlayerIds.length;
  const out: Record<string, number> = {};
  orderedPlayerIds.forEach((pid, idx) => {
    const bp = basePointsForPlace(n, idx);
    out[pid] = bp * multiplier;
  });
  return out;
}
