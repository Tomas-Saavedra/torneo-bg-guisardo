import Link from "next/link";
import { loadGames, loadMatches, loadSchedule, loadPlayers } from "@/lib/sheets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function safeStr(v: unknown): string {
  return v === null || v === undefined ? "" : String(v).trim();
}

/** Normaliza fechas tipo "2025-12-15" (y tolera cosas con hora). */
function normalizeDate(v: unknown): string {
  const s = safeStr(v);
  if (!s) return "";
  return s.split("T")[0].split(" ")[0].trim();
}

function normalizeTime(v: unknown): string {
  const s = safeStr(v);
  if (!s) return "";
  const parts = s.split(":");
  if (parts.length >= 2) return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  return s;
}

type JornadaPageProps = {
  params: { date: string } | Promise<{ date: string }>;
};

export default async function JornadaByDatePage(props: JornadaPageProps) {
  // ✅ IMPORTANTÍSIMO: en Next 15/16 params a veces llega como Promise
  const resolvedParams = await Promise.resolve(props.params);
  const dateParam = safeStr(resolvedParams?.date);
  const dateNorm = normalizeDate(dateParam);

  const [players, games, matches, schedule] = await Promise.all([
    loadPlayers(),
    loadGames(),
    loadMatches(),
    loadSchedule(),
  ]);

  // Índices rápidos
  const gameById = new Map<string, any>(games.map((g: any) => [safeStr(g.game_id), g]));
  const playerNameById = new Map<string, string>(
    players.map((p: any) => [safeStr(p.player_id), safeStr(p.name) || safeStr(p.player_id)])
  );

  // Info de la fecha (Schedule)
  const sched = (schedule as any[]).find((s: any) => normalizeDate(s.date) === dateNorm);

  // Matches de la fecha
  const matchesForDate = (matches as any[])
    .filter((m: any) => normalizeDate(m.session_date) === dateNorm)
    .sort((a: any, b: any) => normalizeTime(a.start_time).localeCompare(normalizeTime(b.start_time)));

  const titleLine = sched
    ? `${dateNorm}${sched.start_time ? ` ${normalizeTime(sched.start_time)}` : ""}${
        sched.end_time ? `–${normalizeTime(sched.end_time)}` : ""
      }${sched.location ? ` • ${safeStr(sched.location)}` : ""}${sched.notes ? ` • ${safeStr(sched.notes)}` : ""}`
    : dateNorm || "Jornada";

  // Puntos por puesto (editables)
  const pointsByPlace = [10, 6, 3, 1, 0];

  const placeLabel = (i: number) => {
    if (i === 0) return "🥇 Ganador";
    if (i === 1) return "🥈 Segundo";
    if (i === 2) return "🥉 Tercero";
    return `${i + 1}° puesto`;
  };

  return (
    <main style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <div style={{ marginBottom: 12 }}>
        <Link href="/jornadas">← Volver a jornadas</Link>
      </div>

      <h1 style={{ margin: "8px 0 6px" }}>Jornada</h1>
      <div style={{ opacity: 0.85, marginBottom: 18 }}>{titleLine}</div>

      <h2 style={{ marginTop: 18 }}>Partidas</h2>

      {matchesForDate.length === 0 ? (
        <p>No hay partidas cargadas para esta jornada.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {matchesForDate.map((m: any, idx: number) => {
            const gameId = safeStr(m.game_id);
            const game = gameById.get(gameId);
            const gameName = safeStr(game?.name) || gameId || "(sin juego)";
            const startTime = normalizeTime(m.start_time);

            // p1..p5 = orden de llegada (puestos)
            const ids = [m.p1, m.p2, m.p3, m.p4, m.p5]
              .map((x: any) => safeStr(x).trim())
              .filter(Boolean);

            const rows = ids.map((id: string, i: number) => ({
              id,
              name: playerNameById.get(id) ?? id,
              place: placeLabel(i),
              pts: pointsByPlace[i] ?? 0,
            }));

            return (
              <div
                key={`${dateNorm}-${gameId}-${startTime}-${idx}`}
                style={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 12,
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
                      <li key={`${r.id}-${i}`}>
                        <b>{r.place}:</b> {r.name}{" "}
                        <span style={{ opacity: 0.75 }}> (+{r.pts}p)</span>
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
