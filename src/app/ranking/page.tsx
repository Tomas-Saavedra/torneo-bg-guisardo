import { computeLeaderboard } from "@/lib/league";
import { loadGames, loadMatches, loadPlayers } from "@/lib/sheets";

const MIN_MATCHES = 1;

export default async function RankingPage() {
  const [players, games, matches] = await Promise.all([
    loadPlayers(),
    loadGames(),
    loadMatches(),
  ]);

  const { eligible, all, minMatches } = computeLeaderboard({
    players,
    games,
    matches,
    minMatches: MIN_MATCHES,
  });

  const rows = eligible.length ? eligible : all;

  return (
    <main style={{ padding: 24 }}>
      <h1>🏆 Ranking</h1>
      <p>Mínimo de partidas para aparecer: {minMatches}</p>

      {rows.length === 0 ? (
        <p>No hay datos suficientes todavía.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>#</th>
              <th style={{ textAlign: "left", padding: 8 }}>Jugador</th>
              <th style={{ textAlign: "left", padding: 8 }}>Puntos</th>
              <th style={{ textAlign: "left", padding: 8 }}>Partidas</th>
              <th style={{ textAlign: "left", padding: 8 }}>Victorias</th>
              <th style={{ textAlign: "left", padding: 8 }}>Podios</th>
              <th style={{ textAlign: "left", padding: 8 }}>Promedio</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, idx) => (
              <tr key={p.player_id}>
                <td style={{ padding: 8, borderTop: "1px solid #eee" }}>{idx + 1}</td>
                <td style={{ padding: 8, borderTop: "1px solid #eee" }}>{p.name}</td>
                <td style={{ padding: 8, borderTop: "1px solid #eee" }}>{p.points}</td>
                <td style={{ padding: 8, borderTop: "1px solid #eee" }}>{p.matches}</td>
                <td style={{ padding: 8, borderTop: "1px solid #eee" }}>{p.wins}</td>
                <td style={{ padding: 8, borderTop: "1px solid #eee" }}>{p.podiums}</td>
                <td style={{ padding: 8, borderTop: "1px solid #eee" }}>{p.avgPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
