// src/app/page.tsx
import Link from "next/link";
import { loadGames, loadMatches, loadPlayers, loadSchedule } from "@/lib/sheets";
import { computeLeaderboard } from "@/lib/league";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [players, games, matches, schedule] = await Promise.all([
    loadPlayers(),
    loadGames(),
    loadMatches(),
    loadSchedule(),
  ]);

  const leaderboard = computeLeaderboard({
    players,
    games,
    matches,
  });

  const sortedSchedule = [...schedule].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  const nextDate = sortedSchedule[0];

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
        Torneo de Juegos de Mesa
      </h1>

      <p style={{ opacity: 0.75, marginBottom: 24 }}>
        Ranking general, próximas jornadas y partidas registradas.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, marginBottom: 12 }}>🏆 Ranking</h2>

        {leaderboard.length === 0 && <p>No hay partidas cargadas.</p>}

        {leaderboard.length > 0 && (
          <ol>
            {leaderboard.slice(0, 5).map((p, idx) => (
              <li key={p.player_id}>
                <b>
                  #{idx + 1} {p.player_name}
                </b>{" "}
                — {p.points} pts ({p.games} partidas, {p.wins} wins)
              </li>
            ))}
          </ol>
        )}

        <Link href="/ranking">Ver ranking completo →</Link>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, marginBottom: 12 }}>📅 Próxima jornada</h2>

        {nextDate ? (
          <div>
            <b>{nextDate.date}</b>
            {nextDate.location && <> — {nextDate.location}</>}
          </div>
        ) : (
          <p>No hay fechas programadas.</p>
        )}

        <Link href="/calendario">Ver calendario →</Link>
      </section>

      <section>
        <h2 style={{ fontSize: 24, marginBottom: 12 }}>🎲 Navegación</h2>
        <ul>
          <li>
            <Link href="/juegos">Juegos</Link>
          </li>
          <li>
            <Link href="/jornadas">Jornadas</Link>
          </li>
          <li>
            <Link href="/ranking">Ranking</Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
