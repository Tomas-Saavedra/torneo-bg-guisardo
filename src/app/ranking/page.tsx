import { loadGames, loadMatches, loadPlayers } from "@/lib/sheets";
import { computeLeaderboard } from "@/lib/league";

export default async function RankingPage() {
  const [players, games, matches] = await Promise.all([
    loadPlayers(),
    loadGames(),
    loadMatches(),
  ]);

  const MIN_MATCHES = 10;
  const { eligible, all } = computeLeaderboard(players, games, matches, MIN_MATCHES);

  // Ordenamos ALL con el mismo criterio que eligible (rating desc, heavyWins desc, matches desc)
  const sortedAll = [...all].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.heavyWins !== a.heavyWins) return b.heavyWins - a.heavyWins;
    return b.matches - a.matches;
  });

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Ranking</h1>

      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Modelo A: <b>Rating = Puntos / Partidas</b>. Mínimo para ser campeón: <b>{MIN_MATCHES}</b> partidas.
      </p>

      <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <div style={{ opacity: 0.7, fontSize: 12 }}>Jugadores</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{all.length}</div>
        </div>
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <div style={{ opacity: 0.7, fontSize: 12 }}>Elegibles</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{eligible.length}</div>
        </div>
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <div style={{ opacity: 0.7, fontSize: 12 }}>Partidas oficiales</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{matches.length}</div>
        </div>
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <div style={{ opacity: 0.7, fontSize: 12 }}>Juegos cargados</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{games.length}</div>
        </div>
      </div>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 8 }}>Tabla general (todos)</h2>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thL}>#</th>
              <th style={thL}>Jugador</th>
              <th style={thR}>Rating</th>
              <th style={thR}>Puntos</th>
              <th style={thR}>Partidas</th>
              <th style={thR}>Victorias pesadas</th>
              <th style={thC}>Elegible</th>
            </tr>
          </thead>
          <tbody>
            {sortedAll.map((p, i) => {
              const isEligible = p.matches >= MIN_MATCHES;
              return (
                <tr key={p.player_id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdL}>{i + 1}</td>
                  <td style={tdL}>{p.name}</td>
                  <td style={tdR}>{p.rating.toFixed(2)}</td>
                  <td style={tdR}>{p.points.toFixed(2)}</td>
                  <td style={tdR}>{p.matches}</td>
                  <td style={tdR}>{p.heavyWins}</td>
                  <td style={tdC}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 999,
                        border: "1px solid #ddd",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {isEligible ? "Sí" : "No"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p style={{ marginTop: 10, opacity: 0.75 }}>
          Desempates: 1) rating 2) victorias en pesados 3) partidas jugadas.
        </p>
      </section>
    </main>
  );
}

const thL: React.CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: 8,
};
const thR: React.CSSProperties = {
  textAlign: "right",
  borderBottom: "1px solid #ddd",
  padding: 8,
};
const thC: React.CSSProperties = {
  textAlign: "center",
  borderBottom: "1px solid #ddd",
  padding: 8,
};
const tdL: React.CSSProperties = { padding: 8, textAlign: "left" };
const tdR: React.CSSProperties = { padding: 8, textAlign: "right" };
const tdC: React.CSSProperties = { padding: 8, textAlign: "center" };
