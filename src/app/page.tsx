// src/app/page.tsx
import Link from "next/link";
import { loadGames, loadMatches, loadPlayers, loadSchedule } from "@/lib/sheets";
import { computeLeaderboard } from "@/lib/league";

const MIN_MATCHES = 1;

export default async function HomePage() {
  const [players, games, matches, schedule] = await Promise.all([
    loadPlayers(),
    loadGames(),
    loadMatches(),
    loadSchedule(),
  ]);

  const { eligible, all } = computeLeaderboard({
    players,
    games,
    matches,
    minMatches: MIN_MATCHES,
  });

  const top = (eligible.length ? eligible : all).slice(0, 10);
  const next = [...schedule].sort((a, b) => String(a.date).localeCompare(String(b.date)))[0];

  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Liga de Juegos de Mesa</h1>

      <nav style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <Link href="/">Inicio</Link>
        <Link href="/ranking">Ranking</Link>
        <Link href="/jornadas">Jornadas</Link>
        <Link href="/juegos">Juegos</Link>
        <Link href="/calendario">Calendario</Link>
      </nav>

      <section style={{ marginTop: 18 }}>
        <h2>Próxima fecha</h2>
        {next ? (
          <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <b>{String(next.date)}</b> {String(next.start_time)}–{String(next.end_time)} •{" "}
            {String(next.location)}
            {next.notes ? ` • ${String(next.notes)}` : ""}
          </div>
        ) : (
          <p>No hay fechas cargadas.</p>
        )}
      </section>

      <section style={{ marginTop: 22 }}>
        <h2>Top ranking</h2>
        {top.length === 0 ? (
          <p>No hay datos suficientes todavía.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 6, borderBottom: "1px solid #ddd" }}>#</th>
                <th style={{ textAlign: "left", padding: 6, borderBottom: "1px solid #ddd" }}>
                  Jugador
                </th>
                <th style={{ textAlign: "right", padding: 6, borderBottom: "1px solid #ddd" }}>
                  Puntos
                </th>
                <th style={{ textAlign: "right", padding: 6, borderBottom: "1px solid #ddd" }}>
                  Partidas
                </th>
              </tr>
            </thead>
            <tbody>
              {top.map((p, i) => (
                <tr key={p.player_id}>
                  <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0" }}>{i + 1}</td>
                  <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0" }}>{p.name}</td>
                  <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>
                    {p.points}
                  </td>
                  <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>
                    {p.matches}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
