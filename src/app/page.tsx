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

  const nextDate =
    schedule
      .map((s) => String(s.date ?? "").trim())
      .filter(Boolean)
      .sort()[0] ?? null;

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Liga de Juegos de Mesa</h1>

      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link href="/">Inicio</Link>
        <Link href="/ranking">Ranking</Link>
        <Link href="/jornadas">Jornadas</Link>
        <Link href="/juegos">Juegos</Link>
        <Link href="/calendario">Calendario</Link>
      </nav>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Próxima fecha</h2>
        {nextDate ? (
          <p style={{ opacity: 0.8 }}>
            <Link href={`/jornadas/${nextDate}`}>{nextDate}</Link>
          </p>
        ) : (
          <p style={{ opacity: 0.7 }}>No hay fechas cargadas.</p>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Top ranking</h2>

        {top.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No hay datos suficientes todavía.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 6, borderBottom: "1px solid #eee" }}>#</th>
                <th style={{ textAlign: "left", padding: 6, borderBottom: "1px solid #eee" }}>Jugador</th>
                <th style={{ textAlign: "right", padding: 6, borderBottom: "1px solid #eee" }}>Puntos</th>
                <th style={{ textAlign: "right", padding: 6, borderBottom: "1px solid #eee" }}>Partidas</th>
                <th style={{ textAlign: "right", padding: 6, borderBottom: "1px solid #eee" }}>Victorias</th>
              </tr>
            </thead>
            <tbody>
              {top.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0" }}>{i + 1}</td>
                  <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0" }}>{p.name}</td>
                  <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>{p.points}</td>
                  <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>{p.matches}</td>
                  <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>{p.wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: 24, opacity: 0.75 }}>
        <details>
          <summary>Debug rápido</summary>
          <div style={{ marginTop: 8 }}>
            Players: {players.length} • Games: {games.length} • Matches: {matches.length} • Schedule: {schedule.length}
          </div>
        </details>
      </section>
    </main>
  );
}
