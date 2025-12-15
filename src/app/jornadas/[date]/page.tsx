import Link from "next/link";
import { loadGames, loadMatches, loadPlayers } from "@/lib/sheets";
import { buildSessions, sessionTotals } from "@/lib/sessions";

export default async function JornadaDetallePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  const [players, games, matches] = await Promise.all([
    loadPlayers(),
    loadGames(),
    loadMatches(),
  ]);

  const sessions = buildSessions(players, games, matches);
  const session = sessions.find((s) => s.session_date === date);

  if (!session) {
    return (
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
        <p>
          <Link href="/jornadas">← Volver</Link>
        </p>
        <h1>Jornada no encontrada</h1>
        <p>No existe una jornada con fecha: {date}</p>
      </main>
    );
  }

  const totals = sessionTotals(session);

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>

      <h1>Jornada: {session.session_date}</h1>

      <section style={{ marginTop: 16 }}>
        <h2>Resumen del día</h2>
        {totals.length === 0 ? (
          <p>No hay partidas cargadas para esta fecha.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thL}>#</th>
                <th style={thL}>Jugador</th>
                <th style={thR}>Puntos</th>
                <th style={thR}>Victorias</th>
              </tr>
            </thead>
            <tbody>
              {totals.map((t, i) => (
                <tr key={t.player_id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdL}>{i + 1}</td>
                  <td style={tdL}>{t.name}</td>
                  <td style={tdR}>{t.points.toFixed(2)}</td>
                  <td style={tdR}>{t.wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Partidas</h2>

        <div style={{ display: "grid", gap: 12 }}>
          {session.matches.map((m, idx) => (
            <div key={idx} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <b>{m.game_name}</b>{" "}
                  <span style={{ opacity: 0.7 }}>
                    (×{m.multiplier}) · {m.start_time}
                  </span>
                </div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                <thead>
                  <tr>
                    <th style={thL}>Puesto</th>
                    <th style={thL}>Jugador</th>
                    <th style={thR}>Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {m.placements.map((p) => (
                    <tr key={p.player_id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={tdL}>{p.place}</td>
                      <td style={tdL}>{p.name}</td>
                      <td style={tdR}>{p.points.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
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
const tdL: React.CSSProperties = { padding: 8, textAlign: "left" };
const tdR: React.CSSProperties = { padding: 8, textAlign: "right" };
