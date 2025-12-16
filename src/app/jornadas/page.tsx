import Link from "next/link";
import { loadPlayers, loadGames, loadSchedule, loadMatches } from "@/lib/sheets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function safeStr(v: unknown) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function ErrorBox({ title, msg }: { title: string; msg: string }) {
  return (
    <div
      style={{
        border: "1px solid #f5c2c2",
        background: "#fff5f5",
        padding: 12,
        borderRadius: 12,
        marginTop: 16,
      }}
    >
      <b>{title}</b>
      <div style={{ marginTop: 8, fontFamily: "monospace", fontSize: 12 }}>{msg}</div>
      <div style={{ marginTop: 8, opacity: 0.8 }}>
        Tip: revisá que tus variables de entorno estén cargadas en <b>Production</b> y que los CSV de Sheets estén “Publish to web”.
      </div>
    </div>
  );
}

export default async function HomePage() {
  try {
    // Cargamos todo pero sin romper si algo viene raro
    const [playersRaw, gamesRaw, scheduleRaw, matchesRaw] = await Promise.all([
      loadPlayers().catch((e) => ({ __error: e })),
      loadGames().catch((e) => ({ __error: e })),
      loadSchedule().catch((e) => ({ __error: e })),
      loadMatches().catch((e) => ({ __error: e })),
    ]);

    const err =
      (playersRaw as any)?.__error ||
      (gamesRaw as any)?.__error ||
      (scheduleRaw as any)?.__error ||
      (matchesRaw as any)?.__error;

    if (err) {
      const msg = err?.message ? String(err.message) : String(err);
      return (
        <main style={{ maxWidth: 900, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
          <h1>Liga de Juegos de Mesa</h1>
          <p>El deploy está ok, pero hubo un error cargando datos.</p>
          <ErrorBox title="Error cargando Sheets" msg={msg} />

          <nav style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/ranking">Ranking</Link>
            <Link href="/jornadas">Jornadas</Link>
            <Link href="/juegos">Juegos</Link>
            <Link href="/calendario">Calendario</Link>
          </nav>
        </main>
      );
    }

    const players = Array.isArray(playersRaw) ? playersRaw : [];
    const games = Array.isArray(gamesRaw) ? gamesRaw : [];
    const schedule = Array.isArray(scheduleRaw) ? scheduleRaw : [];
    const matches = Array.isArray(matchesRaw) ? matchesRaw : [];

    // Próxima fecha: buscamos la primera con date válida (si hay)
    const scheduleNormalized = schedule
      .map((s: any) => ({
        date: safeStr(s?.date),
        start: safeStr(s?.start_time),
        end: safeStr(s?.end_time),
        location: safeStr(s?.location),
      }))
      .filter((s) => s.date.length > 0)
      .sort((a, b) => a.date.localeCompare(b.date));

    const next = scheduleNormalized[0];

    return (
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
        <h1>Liga de Juegos de Mesa</h1>

        <nav style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/">Inicio</Link>
          <Link href="/ranking">Ranking</Link>
          <Link href="/jornadas">Jornadas</Link>
          <Link href="/juegos">Juegos</Link>
          <Link href="/calendario">Calendario</Link>
        </nav>

        <section style={{ marginTop: 18 }}>
          <h2 style={{ marginBottom: 6 }}>Próxima fecha</h2>
          {next ? (
            <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
              <div>
                <b>{next.date}</b> {next.start ? ` ${next.start}` : ""}{next.end ? `–${next.end}` : ""}{" "}
                {next.location ? `· ${next.location}` : ""}
              </div>
            </div>
          ) : (
            <p>No hay fechas cargadas.</p>
          )}
        </section>

        <section style={{ marginTop: 18, opacity: 0.85 }}>
          <h3>Debug rápido</h3>
          <div>
            Players: {players.length} · Games: {games.length} · Matches: {matches.length} · Schedule: {schedule.length}
          </div>
        </section>
      </main>
    );
  } catch (e: any) {
    // Catch final: no se cae nunca la home
    const msg = e?.message ? String(e.message) : String(e);
    return (
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
        <h1>Liga de Juegos de Mesa</h1>
        <ErrorBox title="Error inesperado en el servidor" msg={msg} />
      </main>
    );
  }
}
