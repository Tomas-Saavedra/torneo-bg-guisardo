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
    <main style={{ maxWidth: 920, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Ranking</h1>

      <nav style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <Link href="/">Inicio</Link>
        <Link href="/ranking">Ranking</Link>
        <Link href="/jornadas">Jornadas</Link>
        <Link href="/juegos">Juegos</Link>
        <Link href="/calendario">Calendario</Link>
      </nav>

      <p style={{ marginTop: 0, opacity: 0.75 }}>
        Mínimo para ranking “oficial”: {minMatches} partida(s).
      </p>

      {rows.length === 0 ? (
        <p>No hay datos todavía.</p>
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
              <th style={{ textAlign: "right", padding: 6, borderBottom: "1px solid #ddd" }}>
                Victorias
              </th>
              <th style={{ textAlign: "right", padding: 6, borderBottom: "1px solid #ddd" }}>
                Podios
              </th>
              <th style={{ textAlign: "right", padding: 6, borderBottom: "1px solid #ddd" }}>
                Prom.
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={p.player_id}>
                <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0" }}>{i + 1}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0" }}>{p.name}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>
                  {p.points}
                </td>
                <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>
                  {p.matches}
                </td>
                <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>
                  {p.wins}
                </td>
                <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>
                  {p.podiums}
                </td>
                <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>
                  {p.avgPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
