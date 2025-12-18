// src/app/jornadas/[date]/page.tsx

import Link from "next/link";
import { loadGames, loadMatches, loadSchedule } from "@/lib/sheets";
import { buildMatchesForDate, findScheduleForDate } from "@/lib/sessions";

export default async function JornadaByDatePage(props: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await props.params;

  const [games, matches, schedule] = await Promise.all([
    loadGames(),
    loadMatches(),
    loadSchedule(),
  ]);

  const sched = findScheduleForDate(schedule, date);

  const matchesForDate = buildMatchesForDate({
    date,
    matches,
    games,
  });

  const headerBits = [
    sched?.start_time && sched?.end_time ? `${sched.start_time}–${sched.end_time}` : undefined,
    sched?.location,
    sched?.notes,
  ].filter(Boolean);

  const placeLabel = (idx: number) => {
    if (idx === 0) return "🏆 Ganador";
    if (idx === 1) return "🥈 Segundo";
    if (idx === 2) return "🥉 Tercero";
    return `4° puesto`;
  };

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px" }}>
      <Link href="/jornadas">← Volver a jornadas</Link>

      <h1 style={{ marginTop: 12 }}>Jornada</h1>
      <div style={{ opacity: 0.8, marginBottom: 18 }}>
        {date}
        {headerBits.length ? ` • ${headerBits.join(" • ")}` : ""}
      </div>

      <h2>Partidas</h2>

      {matchesForDate.length === 0 ? (
        <div style={{ opacity: 0.75 }}>No hay partidas cargadas para esta jornada.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {matchesForDate.map((m) => {
            const rows = m.placements.map((name, idx) => {
              const pts = m.pointsByPlayer[name] ?? 0;
              return {
                name,
                label: placeLabel(idx),
                pts,
              };
            });

            return (
              <div
                key={m.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 16,
                  background: "white",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{m.game_name}</div>
                <div style={{ opacity: 0.75, marginBottom: 10 }}>
                  {m.session_date}
                  {m.start_time ? ` • ${m.start_time}` : ""}
                </div>

                <div style={{ fontWeight: 600, marginBottom: 6 }}>Resultados</div>

                {rows.length === 0 ? (
                  <div style={{ opacity: 0.7 }}>—</div>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {rows.map((r, i) => (
                      <li key={`${m.id}-${i}`}>
                        <b>{r.label}:</b> {r.name}{" "}
                        <span style={{ opacity: 0.75 }}>({r.pts >= 0 ? "+" : ""}{r.pts}p)</span>
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
