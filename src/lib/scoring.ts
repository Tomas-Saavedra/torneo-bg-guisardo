// src/lib/scoring.ts

import type { MatchRow } from "./sheets";

const BASE_POINTS_BY_PLACE = [10, 6, 3, 1, 0] as const;

export function getPlacementsFromMatch(match: MatchRow): string[] {
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
  placements: string[],
  multiplier: number = 1
): Record<string, number> {
  const mult = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;

  const out: Record<string, number> = {};
  for (let idx = 0; idx < placements.length; idx++) {
    const name = (placements[idx] ?? "").trim();
    if (!name) continue;

    const base = BASE_POINTS_BY_PLACE[idx] ?? 0;
    const raw = base * mult;

    // redondeo estable
    const pts = Math.round(raw * 100) / 100;

    out[name] = (out[name] ?? 0) + pts;
  }
  return out;
}
