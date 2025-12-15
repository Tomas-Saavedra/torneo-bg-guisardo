import Link from "next/link";
import { loadMatches } from "@/lib/sheets";

export const dynamic = "force-dynamic";

function safeStr(v: unknown) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

export default async function JornadaDetail({
  params,
}: {
  params: { date: string };
}) {
  let rows: any[] = [];
  let errorMsg = "";

  try {
    const raw = await loadMatches();

    rows = raw
      .map((m: any) => ({
        session_date: safeStr(m?.session_date),
        game_id: safeStr(m?.game_id),
        start_time: safeStr(m?.start_time),
        p1: safeStr(m?.p1),
        p2: safeStr(m?.p2),
        p3: safeStr(m?.p3),
        p4: safeStr(m?.p4),
        p5: safeStr(m?.p5),
      }))
      .filter((m) => m.session_date === params.date);
  } catch (e: any) {
    errorMsg = e?.message ? String(e.message) : "Error cargando jornada";
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h1>Jornada {params.date}</h1>

      {errorMsg ? (
        <div style={errorBox}>
          <b>Error</b>
          <div style={mono}>{errorMsg}</div>
        </div>
      ) : rows.length === 0 ? (
        <p>No hay partidas para esta fecha.</p>
      ) : (
        rows.map((r, i) => (
          <div key={i} style={card}>
            <b>{r.game_id || "Juego desconocido"}</b>
            <div>Hora: {r.start_time || "?"}</div>
            <div>
              Jugadores: {[r.p1, r.p2, r.p3, r.p4, r.p5].filter(Boolean).join(", ")}
            </div>
          </div>
        ))
      )}

      <p style={{ marginTop: 24 }}>
        <Link href="/jornadas">← Volver a jornadas</Link>
      </p>
    </main>
  );
}

const card: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 12,
  marginTop: 12,
};

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
