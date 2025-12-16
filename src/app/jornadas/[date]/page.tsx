import Link from "next/link";
import { loadGames, loadMatches, loadSchedule } from "@/lib/sheets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function safeStr(v: unknown): string {
  return v === null || v === undefined ? "" : String(v).trim();
}

export default async function JornadaByDatePage({
  params,
}: {
  params: { date: string };
}) {
  const date = safeStr(params.date);

  const [games, matches, schedule] = await Promise.all([
    loadGames(),
    loadMatches(),
    loadSchedule(),
  ]);

  const daySchedule = schedule.find((s) => s.date === date);

  const matchesOfDay = matches.filter(
    (m) => safeStr(m.session_date) === date
  );

  return (
    <main style={{ padding: 24 }}>
      <Link href="/jornadas">← Volver a jornadas</Link>

      <h1 style={{ marginTop: 12 }}>Jornada {date}</h1>

      {daySchedule && (
        <p style={{ marginTop: 4, color: "#555" }}>
          {daySchedule.start_time ?? ""}{" "}
          {daySchedule.end_time ? `– ${daySchedule.end_time}` : ""}{" "}
          {daySchedule.location ? `· ${daySchedule.location}` : ""}
        </p>
      )}

      <h2 style={{ marginTop: 24 }}>Partidas</h2>

      {matchesOfDay.length === 0 ? (
        <p>No hay partidas cargadas para esta jornada.</p>
      ) : (
        <ul style={{ marginTop: 12 }}>
          {matchesOfDay.map((m, idx) => {
            const game = games.find((g) => g.game_id === m.game_id);

            const players = [m.p1, m.p2, m.p3, m.p4, m.p5]
              .map(safeStr)
              .filter(Boolean);

            return (
              <li
                key={idx}
                style={{
                  marginBottom: 12,
                  padding: 12,
                  border: "1px solid #ddd",
                  borderRadius: 6,
                }}
              >
                <strong>{game?.name ?? m.game_id}</strong>
                <div style={{ fontSize: 14, color: "#555" }}>
                  Hora: {m.start_time ?? "—"}
                </div>
                <div style={{ marginTop: 4 }}>
                  Jugadores: {players.join(", ")}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
