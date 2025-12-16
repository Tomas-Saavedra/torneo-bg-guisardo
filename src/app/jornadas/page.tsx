// src/app/jornadas/page.tsx
import Link from "next/link";
import { loadSchedule, loadMatches } from "@/lib/sheets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function safeStr(v: unknown) {
  return v === null || v === undefined ? "" : String(v).trim();
}

export default async function JornadasPage() {
  const [schedule, matches] = await Promise.all([loadSchedule(), loadMatches()]);

  // Fechas desde schedule
  const scheduleDates = schedule
    .map((s: any) => safeStr(s.date))
    .filter(Boolean);

  // Fechas desde matches (por si no está en schedule)
  const matchDates = matches
    .map((m: any) => safeStr(m.session_date))
    .filter(Boolean);

  const allDates = Array.from(new Set([...scheduleDates, ...matchDates])).sort((a, b) =>
    a.localeCompare(b)
  );

  // Próxima fecha: la primera >= hoy (si no hay, la última)
  const today = new Date().toISOString().slice(0, 10);
  const nextDate =
    allDates.find((d) => d >= today) ?? (allDates.length ? allDates[allDates.length - 1] : "");

  const scheduleByDate = new Map<string, any>();
  for (const s of schedule as any[]) {
    const d = safeStr(s.date);
    if (d) scheduleByDate.set(d, s);
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Jornadas</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Elegí una fecha para ver los matches y resultados.
      </p>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ marginBottom: 8 }}>Próxima fecha</h2>
        {nextDate ? (
          <div
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: 10,
              padding: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{nextDate}</div>
              {scheduleByDate.get(nextDate) ? (
                <div style={{ opacity: 0.8, marginTop: 4 }}>
                  {safeStr(scheduleByDate.get(nextDate)?.start_time) || "?"}–
                  {safeStr(scheduleByDate.get(nextDate)?.end_time) || "?"}
                  {" · "}
                  {safeStr(scheduleByDate.get(nextDate)?.location) || "Sin ubicación"}
                </div>
              ) : (
                <div style={{ opacity: 0.8, marginTop: 4 }}>Sin info en Schedules</div>
              )}
            </div>

            <Link
              href={`/jornadas/${encodeURIComponent(nextDate)}`}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                textDecoration: "none",
              }}
            >
              Ver jornada →
            </Link>
          </div>
        ) : (
          <p>No hay fechas cargadas todavía.</p>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 8 }}>Todas las fechas</h2>

        {allDates.length === 0 ? (
          <p>No hay jornadas para listar.</p>
        ) : (
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            {allDates.map((d) => {
              const sched = scheduleByDate.get(d);
              const subtitle = sched
                ? `${safeStr(sched.start_time) || "?"}–${safeStr(sched.end_time) || "?"} · ${
                    safeStr(sched.location) || "Sin ubicación"
                  }`
                : "Sin info en Schedules";

              const playedCount = (matches as any[]).filter((m) => safeStr(m.session_date) === d)
                .length;

              return (
                <li key={d} style={{ marginBottom: 8 }}>
                  <Link href={`/jornadas/${encodeURIComponent(d)}`}>{d}</Link>
                  <span style={{ opacity: 0.75 }}>{" — "}{subtitle}</span>
                  <span style={{ opacity: 0.75 }}>{" · "}{playedCount} match(es)</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
