import { loadSchedule } from "@/lib/sheets";

function safeStr(v: any) {
  return (v ?? "").toString().trim();
}

function parseLocalDate(dateStr: string) {
  // Espera YYYY-MM-DD; si viene mal, devolvemos null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || !mo || !d) return null;
  return new Date(y, mo - 1, d, 0, 0, 0, 0);
}

function statusFor(dateStr: string) {
  const today = new Date();
  const today0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const d = parseLocalDate(dateStr);
  if (!d) return "unknown";
  if (d.getTime() < today0.getTime()) return "past";
  if (d.getTime() === today0.getTime()) return "today";
  return "future";
}

export default async function CalendarioPage() {
  const scheduleRaw = await loadSchedule();

  // Normalizamos y filtramos filas incompletas
  const schedule = scheduleRaw
    .map((s) => ({
      date: safeStr(s.date),
      start_time: safeStr(s.start_time),
      end_time: safeStr(s.end_time),
      location: safeStr(s.location),
      notes: safeStr(s.notes),
    }))
    .filter((s) => s.date.length > 0); // si la fecha está vacía, descartamos la fila

  const sorted = [...schedule].sort((a, b) => a.date.localeCompare(b.date));
  const nextIdx = sorted.findIndex((s) => statusFor(s.date) !== "past");

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Calendario</h1>
      <p style={{ opacity: 0.8 }}>
        Próximas fechas de la liga (según la pestaña <b>Schedule</b>).
      </p>

      {sorted.length === 0 ? (
        <p>No hay fechas cargadas (o todas las filas están vacías).</p>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {sorted.map((s, idx) => {
            const st = statusFor(s.date);
            const isNext = idx === nextIdx;

            return (
              <div
                key={`${s.date}-${idx}`}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 12,
                  padding: 12,
                  background: isNext ? "#f6fff7" : "#fff",
                }}
              >
                <h2 style={{ margin: 0, fontSize: 18 }}>
                  {s.date} <span style={badgeStyle}>
                    {isNext ? "Próxima" : st === "today" ? "Hoy" : st === "past" ? "Pasada" : st === "future" ? "Futura" : "Sin fecha válida"}
                  </span>
                </h2>

                <div style={{ marginTop: 6, opacity: 0.8 }}>
                  🕒 {s.start_time || "?"}–{s.end_time || "?"}{" "}
                  {s.location ? `· 📍 ${s.location}` : ""}
                </div>

                {s.notes ? <div style={{ marginTop: 6 }}>📝 {s.notes}</div> : null}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  marginLeft: 10,
  padding: "2px 10px",
  borderRadius: 999,
  border: "1px solid #ddd",
  fontSize: 12,
  fontWeight: 700,
};
