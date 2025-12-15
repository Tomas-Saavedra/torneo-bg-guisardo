import { loadSchedule } from "@/lib/sheets";

function parseLocalDate(dateStr: string) {
  // Espera YYYY-MM-DD
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
}

function statusFor(dateStr: string) {
  const today = new Date();
  const today0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const d = parseLocalDate(dateStr);

  if (d.getTime() < today0.getTime()) return "past";
  if (d.getTime() === today0.getTime()) return "today";
  return "future";
}

export default async function CalendarioPage() {
  const schedule = await loadSchedule();

  const sorted = [...schedule].sort((a, b) => a.date.localeCompare(b.date));

  // Próxima = la primera que no sea pasada
  const nextIdx = sorted.findIndex((s) => statusFor(s.date) !== "past");

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Calendario</h1>
      <p style={{ opacity: 0.8 }}>
        Próximas fechas de la liga (según la pestaña <b>Schedule</b>).
      </p>

      {sorted.length === 0 ? (
        <p>No hay fechas cargadas.</p>
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
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 18 }}>
                      {s.date}{" "}
                      {isNext ? (
                        <span style={badgeStyle}>Próxima</span>
                      ) : st === "today" ? (
                        <span style={badgeStyle}>Hoy</span>
                      ) : st === "past" ? (
                        <span style={{ ...badgeStyle, opacity: 0.7 }}>Pasada</span>
                      ) : (
                        <span style={{ ...badgeStyle, opacity: 0.85 }}>Futura</span>
                      )}
                    </h2>
                    <div style={{ marginTop: 6, opacity: 0.8 }}>
                      🕒 {s.start_time}–{s.end_time} {s.location ? `· 📍 ${s.location}` : ""}
                    </div>
                    {s.notes ? <div style={{ marginTop: 6 }}>📝 {s.notes}</div> : null}
                  </div>
                </div>
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
