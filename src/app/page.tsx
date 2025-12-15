import { loadGames, loadMatches, loadPlayers, loadSchedule } from "@/lib/sheets";
import { computeLeaderboard } from "@/lib/league";

export default async function Home() {
  const [players, games, matches, schedule] = await Promise.all([
    loadPlayers(),
    loadGames(),
    loadMatches(),
    loadSchedule(),
  ]);

  const { eligible, all, minMatches } = computeLeaderboard(players, games, matches, 10);

  const sortedSchedule = [...schedule].sort((a, b) => a.date.localeCompare(b.date));
  const nextDate = sortedSchedule[0];

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Liga de Juegos de Mesa</h1>

      <section style={{ marginTop: 24 }}>
        <h2>Próxima fecha</h2>
        {nextDate ? (
          <p>
            <b>{nextDate.date}</b> {nextDate.start_time}–{nextDate.end_time} · {nextDate.location}
            {nextDate.notes ? ` · ${nextDate.notes}` : ""}
          </p>
        ) : (
          <p>No hay fechas cargadas.</p>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Ranking (mínimo {minMatches} partidas)</h2>
        {eligible.length === 0 ? (
          <p>
            Todavía nadie llegó al mínimo. (Hay {all.length} jugadores cargados.)
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>#</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Jugador</th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>Rating</th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>Puntos</th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>Partidas</th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>Victorias pesadas</th>
              </tr>
            </thead>
            <tbody>
              {eligible.map((p, i) => (
                <tr key={p.player_id}>
                  <td style={{ padding: 8 }}>{i + 1}</td>
                  <td style={{ padding: 8 }}>{p.name}</td>
                  <td style={{ padding: 8, textAlign: "right" }}>{p.rating.toFixed(2)}</td>
                  <td style={{ padding: 8, textAlign: "right" }}>{p.points.toFixed(2)}</td>
                  <td style={{ padding: 8, textAlign: "right" }}>{p.matches}</td>
                  <td style={{ padding: 8, textAlign: "right" }}>{p.heavyWins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: 24, opacity: 0.75 }}>
        <h3>Debug rápido (para vos)</h3>
        <p>
          Players: {players.length} · Games: {games.length} · Matches: {matches.length} · Schedule:{" "}
          {schedule.length}
        </p>
      </section>
    </main>
  );
}
