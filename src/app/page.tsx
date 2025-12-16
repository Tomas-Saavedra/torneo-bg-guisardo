import Link from "next/link";
import { loadGames, loadMatches, loadPlayers, loadSchedule } from "@/lib/sheets";
import { computeLeaderboard } from "@/lib/league";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [players, games, matches, schedule] = await Promise.all([
    loadPlayers(),
    loadGames(),
    loadMatches(),
    loadSchedule(),
  ]);

  const MIN_MATCHES = 10;

  // computeLeaderboard devuelve { eligible, all, minMatches }
  const { eligible, all } = computeLeaderboard(players, games, matches, MIN_MATCHES);

  const top = (eligible.length ? eligible : all).slice(0, 10);

  const sortedSchedule = [...schedule].sort((a, b) => a.date.localeCompare(b.date));
  const nextDate = sortedSchedule[0];

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
      <h1 style={{ marginTop: 16 }}>Liga de Juegos de Mesa</h1>

      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "12px 0 18px" }}>
        <Link href="/">🏠 Inicio</Link>
        <Link href="/ranking">🏆 Ranking</Link>
        <Link href="/jornadas">🗓️ Jornadas</Link>
        <Link href="/juegos">🎲 Juegos</Link>
        <Link href="/calendario">📅 Calendario</Link>
      </nav>

      <section style={{ marginTop: 12 }}>
        <h2>Próxima jornada</h2>
        {nextDate ? (
          <p>
            <b>{nextDate.date}</b>
            {nextDate.location ? ` · ${nextDate.location}` : ""}
            {nextDate.start_time ? ` · ${nextDate.start_time}` : ""}
          </p>
        ) : (
          <p>No hay fechas cargadas en Schedules.</p>
        )}
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>Top ranking</h2>

        {top.length === 0 ? (
          <p>No hay datos suficientes todavía.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px" }}>#</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px" }}>Jugador</th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: "8px" }}>Puntos</th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: "8px" }}>Partidas</th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: "8px" }}>Wins</th>
              </tr>
            </thead>
            <tbody>
              {top.map((p, idx) => (
                <tr key={p.player_id}>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{idx + 1}</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{p.name}</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee", textAlign: "right" }}>
                    {p.points}
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee", textAlign: "right" }}>
                    {p.matches}
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee", textAlign: "right" }}>
                    {p.wins}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p style={{ marginTop: 10 }}>
          <Link href="/ranking">Ver ranking completo →</Link>
        </p>
      </section>
    </main>
  );
}
