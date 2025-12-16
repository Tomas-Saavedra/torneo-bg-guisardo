import Link from "next/link";
import { loadGames, loadMatches, loadPlayers } from "@/lib/sheets";
import { computeLeaderboard } from "@/lib/league";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RankingPage() {
  const [players, games, matches] = await Promise.all([
    loadPlayers(),
    loadGames(),
    loadMatches(),
  ]);

  const MIN_MATCHES = 10;

  const { eligible, all, minMatches } = computeLeaderboard(
    players,
    games,
    matches,
    MIN_MATCHES
  );

  // mostramos eligible si hay, si no mostramos all
  const shown = eligible.length ? eligible : all;

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
      <nav style={{ margin: "16px 0 12px" }}>
        <Link href="/">← Volver al inicio</Link>
      </nav>

      <h1>Ranking</h1>

      <p style={{ opacity: 0.8 }}>
        Se muestran jugadores con al menos <b>{minMatches}</b> partidas (si hay).
        Si nadie llega, se muestra el ranking completo.
      </p>

      {shown.length === 0 ? (
        <p>No hay partidas cargadas todavía.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
          <thead>
            <tr>
              <th style={thLeft}>#</th>
              <th style={thLeft}>Jugador</th>
              <th style={thRight}>Puntos</th>
              <th style={thRight}>Partidas</th>
              <th style={thRight}>Wins</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p, idx) => (
              <tr key={p.player_id}>
                <td style={td}>{idx + 1}</td>
                <td style={tdStrong}>{p.name}</td>
                <td style={tdRight}>{p.points}</td>
                <td style={tdRight}>{p.matches}</td>
                <td style={tdRight}>{p.wins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

const thLeft: React.CSSProperties = {
  textAlign: "left",
  padding: "8px",
  borderBottom: "1px solid #ddd",
};

const thRight: React.CSSProperties = {
  textAlign: "right",
  padding: "8px",
  borderBottom: "1px solid #ddd",
};

const td: React.CSSProperties = {
  padding: "8px",
  borderBottom: "1px solid #eee",
};

const tdRight: React.CSSProperties = {
  ...td,
  textAlign: "right",
};

const tdStrong: React.CSSProperties = {
  ...td,
  fontWeight: 700,
};
