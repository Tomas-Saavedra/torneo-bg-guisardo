// src/app/page.tsx

import Link from "next/link";
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

  // próxima fecha (más cercana >= hoy, o primera si no hay)
  const today = new Date();
  const todayStr = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    .toISOString()
    .slice(0, 10);

  const scheduleSorted = [...schedule].sort((a, b) => a.date.localeCompare(b.date));
  const next = scheduleSorted.find((s) => s.date >= todayStr) ?? scheduleSorted[0];

  const gameById = new Map(games.map((g) => [g.game_id, g]));
  const nextGames = next
    ? [next.heavy, next.medium, next.filler1, next.filler2]
        .map((id) => (id ? gameById.get(id) : undefined))
        .filter(Boolean)
    : [];

  console.log("GAME IDS", games.map(g => g.game_id));

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px" }}>
      <h1>Liga de Juegos de Mesa</h1>

      <nav style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <Link href="/">Inicio</Link>
        <Link href="/ranking">Ranking</Link>
        <Link href="/jornadas">Jornadas</Link>
        <Link href="/juegos">Juegos</Link>
        <Link href="/calendario">Calendario</Link>
      </nav>

      <h2>Próxima fecha</h2>

      {next ? (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{next.date}</div>

          {nextGames.length ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {nextGames.map((g) => (
                <div
                  key={g!.game_id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    border: "1px solid #eee",
                    borderRadius: 12,
                    padding: 10,
                    background: "white",
                    minWidth: 220,
                  }}
                >
                  {g!.image_url ? (
                    <img
                      src={g!.image_url}
                      alt={g!.name}
                      width={56}
                      height={56}
                      style={{ borderRadius: 10, objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 10,
                        background: "#f3f3f3",
                      }}
                    />
                  )}

                  <div>
                    <div style={{ fontWeight: 700 }}>{g!.name}</div>
                    <div style={{ opacity: 0.75 }}>
                      {g!.type ? `${g!.type} • ` : ""}
                      x{g!.multiplier ?? 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ opacity: 0.75 }}>
              (Completá en <b>Schedules</b>: heavy, medium, filler1, filler2)
            </div>
          )}
        </div>
      ) : (
        <div style={{ opacity: 0.75 }}>No hay fechas cargadas en Schedules.</div>
      )}

      <h2>Top ranking</h2>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: 6, borderBottom: "1px solid #eee" }}>#</th>
            <th style={{ textAlign: "left", padding: 6, borderBottom: "1px solid #eee" }}>Jugador</th>
            <th style={{ textAlign: "right", padding: 6, borderBottom: "1px solid #eee" }}>Puntos</th>
            <th style={{ textAlign: "right", padding: 6, borderBottom: "1px solid #eee" }}>Partidas</th>
            <th style={{ textAlign: "right", padding: 6, borderBottom: "1px solid #eee" }}>Victorias</th>
          </tr>
        </thead>
        <tbody>
          {top.map((p, i) => (
            <tr key={p.id}>
              <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0" }}>{i + 1}</td>
              <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0" }}>{p.name}</td>
              <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>{p.points}</td>
              <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>{p.matches}</td>
              <td style={{ padding: 6, borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>{p.wins}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
