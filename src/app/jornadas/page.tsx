import Link from "next/link";
import { loadMatches } from "@/lib/sheets";

export const dynamic = "force-dynamic";

function safeStr(v: unknown) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

export default async function JornadasPage() {
  let matches: any[] = [];
  let errorMsg = "";

  try {
    const raw = await loadMatches();

    matches = raw
      .map((m: any) => ({
        session_date: safeStr(m?.session_date),
        game_id: safeStr(m?.game_id),
        start_time: safeStr(m?.start_time),
      }))
      .filter((m) => m.session_date.length > 0);
  } catch (e: any) {
    errorMsg = e?.message ? String(e.message) : "Error cargando jornadas";
  }

  const byDate = new Map<string, number>();
  for (const m of matches) {
    byDate.set(m.session_date, (byDate.get(m.session_date) ?? 0) + 1);
  }

  const dates = Array.from(byDate.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h1>Jornadas</h1>

      {errorMsg ? (
        <div style={errorBox}>
          <b>Error cargando jornadas</b>
          <div style={mono}>{errorMsg}</div>
        </div>
      ) : dates.length === 0 ? (
        <p>No hay jornadas cargadas.</p>
      ) : (
        <ul>
          {dates.map(([date, count]) => (
            <li key={date}>
              <Link href={`/jornadas/${date}`}>
                {date} ({count} partidas)
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p style={{ marginTop: 24 }}>
        <Link href="/">← Volver al inicio</Link>
      </p>
    </main>
  );
}

const errorBox: React.CSSProperties = {
  border: "1px solid #f5c2c2",
  background: "#fff5f5",
  padding: 12,
  borderRadius: 12,
};

const mono: React.CSSProperties = {
  marginTop: 8,
  fontFamily: "monospace",
  fontSize: 12,
};
