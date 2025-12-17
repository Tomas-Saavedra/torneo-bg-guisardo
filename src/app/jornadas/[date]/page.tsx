// src/app/jornadas/[date]/page.tsx

import Link from "next/link";
import { loadGames, loadMatches, loadSchedule } from "@/lib/sheets";

const BASE_POINTS_BY_PLACE = [10, 6, 3, 1, 0] as const;

function safeStr(v: unknown): string {
  return String(v ?? "").trim();
}

function normDate(v: unknown): string {
  const s = safeStr(v);
  if (!s) return "";
  return s.slice(0, 10);
}

function toNum(v: unknown, fallback = 1): number {
  const n = typeof v === "number" ? v : Number(String(v ?? "").trim());
  return Number.isFinite(n) ? n : fallback;
}

function formatPts(n: number): string {
  const isInt = Math.abs(n - Math.round(n)) < 1e-9;
  return isInt ? String(Math.round(n)) : String(Math.round(n * 10) / 10);
}

function placeLabel(i: number): string {
  if (i === 0) return "Ganador";
  if (i === 1) return "Segundo";
  if (i === 2) return "Tercero";
  return `${i + 1}° puesto`;
}

function placeEmoji(i: number): string {
  if (i === 0) return "🥇";
  if (i === 1) return "🥈";
  if (i === 2) return "🥉";
  return "🏅";
}

type JornadaPageProps = {
  params: Promise<{ date: string }>;
};

export default async function JornadaByDatePage(props: JornadaPageProps) {
  const { date } = await props.params;

  const dateParam = safeStr(date);
  const dateNorm = normDate(dateParam);

  const [games, matches, schedule] = await Promise.all([
    loadGames(),
    loadMatches(),
    loadSchedule(),
  ]);

  const gameById = new Map<string, any>();
  for (const g of games as any[]) {
    gameById.set(safeStr(g.game_id), g);
  }

  const matchesForDate = (matches as any[]).filter((m) => normDate(m.session_date) === dateNorm);

  const scheduleRow =
    (schedule as any[]).find((s) => normDate(s.date) === dateNorm) ?? null;

  const headerLine = scheduleRow
    ? `${dateNorm}  ${safeStr(scheduleRow.start_time)}–${safeStr(scheduleRow.end_time)} • ${safeStr(scheduleRow.location)} • ${safeStr(scheduleRow.notes)}`
    : dateNorm;

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <div style={{ marginBottom: 10 }}>
        <Link href="/jornadas" style={{ textDecoration: "underline" }}>
          ← Volver a jornadas
        </Link>
      </div>

      <h1 style={{ fontSize: 34, margin: "8px 0 6px" }}>Jornada</h1>
      <div style={{ opacity: 0.75, marginBottom: 18 }}>{headerLine}</div>

      <h2 style={{ fontSize: 22, margin: "14px 0 12px" }}>Partidas</h2>

      {matchesForDate.length === 0 ? (
        <div style={{ opacity: 0.8 }}>No hay partidas cargadas para esta jornada.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {matchesForDate
            .slice()
            .sort((a, b) => safeStr(a.start_time).localeCompare(safeStr(b.start_time)))
            .map((m, idx) => {
              const gameId = safeStr(m.game_id);
              const game = gameById.get(gameId);
              const gameName = safeStr(game?.name) || gameId || "Juego";
              const mult = Math.max(0, toNum(game?.multiplier, 1) || 1);

              const placements = [
                safeStr(m.p1),
                safeStr(m.p2),
                safeStr(m.p3),
                safeStr(m.p4),
                safeStr(m.p5),
              ].filter(Boolean);

              const rows = placements.map((name, i) => {
                const base = BASE_POINTS_BY_PLACE[i] ?? 0;
                const pts = base * mult;
                return {
                  place: placeLabel(i),
                  emoji: placeEmoji(i),
                  name,
                  ptsText: `+${formatPts(pts)}p`,
                };
              });

              const startTime = safeStr(m.start_time);

              return (
                <div
                  key={`${gameId}-${idx}`}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 14,
                    padding: 14,
                    background: "white",
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{gameName}</div>
                  <div style={{ opacity: 0.75, marginBottom: 10 }}>
                    {dateNorm}
                    {startTime ? ` • ${startTime}` : ""}
                  </div>

                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Resultados</div>

                  {rows.length === 0 ? (
                    <div style={{ opacity: 0.7 }}>—</div>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {rows.map((r, i) => (
                        <li key={`${r.name}-${i}`}>
                          {r.emoji} <b>{r.place}:</b> {r.name}{" "}
                          <span style={{ opacity: 0.75 }}>({r.ptsText})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </main>
  );
}
