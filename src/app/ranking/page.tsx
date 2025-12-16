// src/app/ranking/page.tsx
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

  const leaderboard = computeLeaderboard({
    players,
    games,
    matches,
  });

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 8 }}>
          Ranking
        </h1>
        <span style={{ opacity: 0.7 }}>
          ({leaderboard.length} jugadores)
        </span>
      </div>

      <p style={{ opacity: 0.75, marginBottom: 18 }}>
        Calculado a partir de los matches cargados en Sheets.
      </p>

      <div style={{ marginBottom: 18 }}>
        <Link href="/">← Volver al inicio</Link>
      </div>

      {leaderboard.length === 0 ? (
        <p>No hay partidas cargadas todavía, así que no hay ranking.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={th}>#</th>
                <th style={th}>Jugador</th>
                <th style={th}>Puntos</th>
                <th style={th}>Partidas</th>
                <th style={th}>Wins</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((p, idx) => (
                <tr key={p.player_id}>
                  <td style={td}>{idx + 1}</td>
                  <td style={tdStrong}>{p.player_name}</td>
                  <td style={td}>{p.points}</td>
                  <td style={td}>{p.games}</td>
                  <td style={td}>{p.wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const th: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #eee",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #f2f2f2",
  verticalAlign: "top",
};

const tdStrong: React.CSSProperties = {
  ...td,
  fontWeight: 600,
};
