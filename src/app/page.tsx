import { computeLeaderboard } from "@/lib/league";
import { loadGames, loadMatches, loadPlayers, loadSchedule } from "@/lib/sheets";

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

  const next = [...schedule]
    .filter((s) => String(s.date ?? "").trim())
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))[0];

  return (
    <main style={{ padding: 24 }}>
      <h1>Liga de Juegos de Mesa</h1>

      <section style={{ marginTop: 16 }}>
        <h2>Próxima fecha</h2>
        {next ? (
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 12,
              maxWidth: 760,
            }}
          >
            <strong>{String(next.date)}</strong>{" "}
            {next.start_time ? `${String(next.start_time)}` : ""}{" "}
            {next.end_time ? `–${String(next.end_time)}` : ""}{" "}
            {next.location ? `• ${String(next.location)}` : ""}{" "}
            {next.notes ? `• ${String(next.notes)}` : ""}
          </div>
        ) : (
          <p>No hay fechas cargadas.</p>
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
                <th style={{ textAlign: "left", padding: 8 }}>#</th>
                <th style={{ textAlign: "left", padding: 8 }}>Jugador</th>
                <th style={{ textAlign: "left", padding: 8 }}>Puntos</th>
                <th style={{ textAlign: "left", padding: 8 }}>Partidas</th>
              </tr>
            </thead>
            <tbody>
              {top.map((p, idx) => (
                <tr key={p.player_id}>
                  <td style={{ padding: 8, borderTop: "1px solid #eee" }}>{idx + 1}</td>
                  <td style={{ padding: 8, borderTop: "1px solid #eee" }}>{p.name}</td>
                  <td style={{ padding: 8, borderTop: "1px solid #eee" }}>{p.points}</td>
                  <td style={{ padding: 8, borderTop: "1px solid #eee" }}>{p.matches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
