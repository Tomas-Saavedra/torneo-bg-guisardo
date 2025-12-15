import Link from "next/link";
import { loadGames, loadMatches, loadPlayers } from "@/lib/sheets";
import { buildSessions, sessionTotals } from "@/lib/sessions";

export default async function JornadasPage() {
  const [players, games, matches] = await Promise.all([
    loadPlayers(),
    loadGames(),
    loadMatches(),
  ]);

  const sessions = buildSessions(players, games, matches);

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Jornadas</h1>
      <p style={{ opacity: 0.8 }}>
        Acá se listan las jornadas (por fecha) con sus partidas oficiales.
      </p>

      {sessions.length === 0 ? (
        <p>No hay jornadas todavía. Cargá partidas en la pestaña Matches.</p>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {sessions.map((s) => {
            const totals = sessionTotals(s);
            const top = totals[0];

            return (
              <div
                key={s.session_date}
                style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <h2 style={{ margin: 0 }}>
                      <Link href={`/jornadas/${encodeURIComponent(s.session_date)}`}>
                        {s.session_date}
                      </Link>
                    </h2>
                    <div style={{ opacity: 0.7, marginTop: 4 }}>
                      Partidas: <b>{s.matches.length}</b>
                      {top ? (
                        <>
                          {" · "}Ganador del día: <b>{top.name}</b> ({top.points.toFixed(2)} pts)
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div style={{ opacity: 0.7 }}>
                    <Link href={`/jornadas/${encodeURIComponent(s.session_date)}`}>
                      Ver detalle →
                    </Link>
                  </div>
                </div>

                {totals.length > 0 && (
                  <div style={{ marginTop: 10, opacity: 0.9 }}>
                    <b>Top 3:</b>{" "}
                    {totals.slice(0, 3).map((t, i) => (
                      <span key={t.player_id}>
                        {i > 0 ? " · " : ""}
                        {t.name} ({t.points.toFixed(2)})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
