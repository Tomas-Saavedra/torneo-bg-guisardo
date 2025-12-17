// src/app/ranking/page.tsx

import Link from "next/link";
import { loadGames, loadMatches, loadPlayers } from "@/lib/sheets";
import { computeLeaderboard } from "@/lib/league";

const MIN_MATCHES = 1;

export default async function RankingPage() {
  const [players, games, matches] = await Promise.all([loadPlayers(), loadGames(), loadMatches()]);

  const { eligible, all, minMatches } = computeLeaderboard({
    players,
    games,
    matches,
    minMatches: MIN_MATCHES,
  });

  const rows = eligible.length ? eligible : all;

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Ranking</h1>

      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link href="/">Inicio</Link>
        <Link href="/ranking">Ranking</Link>
        <Link href="/jornadas">Jornadas</Link>
        <Link href="/juegos">Juegos</Link>
        <Link href="/calendario">Calendario</Link>
      </nav>

      <p style={{ opacity: 0.75, marginBottom: 12 }}>
        Mínimo de partidas para rankear: <b>{minMatches}</b>
      </p>

      {rows.length === 0 ? (
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
              <th style={{ textAlign: "right", padding: 6, borderBottom: "1px solid #eee" }}>Podios</th>
              <th style={{ textAlign: "right", padding: 6, borderBottom: "1px solid #eee" }}>Prom.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={p.id}>
                <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0" }}>{i + 1}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0" }}>{p.name}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>{p.points}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>{p.matches}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>{p.wins}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>{p.podiums}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>{p.avgPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
