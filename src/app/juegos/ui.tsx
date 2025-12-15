"use client";

import { useMemo, useState } from "react";
import type { Game } from "@/lib/sheets";

export default function GamesClient({ initialGames }: { initialGames: Game[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "heavy" | "medium" | "filler" | "filler_night">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialGames
      .filter((g) => (type === "all" ? true : g.type === type))
      .filter((g) => (q ? g.name.toLowerCase().includes(q) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [initialGames, query, type]);

  const counts = useMemo(() => {
    const c = { heavy: 0, medium: 0, filler: 0, filler_night: 0 };
    for (const g of initialGames) {
      if (g.type === "heavy") c.heavy++;
      else if (g.type === "medium") c.medium++;
      else if (g.type === "filler") c.filler++;
      else if (g.type === "filler_night") c.filler_night++;
    }
    return c;
  }, [initialGames]);

  return (
    <section style={{ marginTop: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar juego…"
          style={{
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: 10,
            minWidth: 260,
          }}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          style={{
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: 10,
          }}
        >
          <option value="all">Todos</option>
          <option value="heavy">Pesados ({counts.heavy})</option>
          <option value="medium">Medios ({counts.medium})</option>
          <option value="filler">Fillers ({counts.filler})</option>
          <option value="filler_night">Fillers nocturnos ({counts.filler_night})</option>
        </select>

        <span style={{ opacity: 0.7 }}>
          Mostrando <b>{filtered.length}</b> / {initialGames.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p>No hay juegos que coincidan con el filtro.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thL}>Juego</th>
              <th style={thL}>Tipo</th>
              <th style={thR}>Multiplicador</th>
              <th style={thR}>Jugadores</th>
              <th style={thR}>ID</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.game_id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdL}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <GameThumb name={g.name} imageUrl={g.image_url} />
                    <div>
                      <div style={{ fontWeight: 700 }}>{g.name}</div>
                      {g.image_url ? (
                        <div style={{ fontSize: 12, opacity: 0.7 }}>con imagen</div>
                      ) : (
                        <div style={{ fontSize: 12, opacity: 0.5 }}>sin imagen</div>
                      )}
                    </div>
                  </div>
                </td>

                <td style={tdL}>
                  <TypeBadge type={g.type} />
                </td>

                <td style={tdR}>×{Number(g.multiplier).toFixed(2)}</td>

                <td style={tdR}>
                  {g.min_p}–{g.max_p}
                </td>

                <td style={tdR} title="game_id usado en Matches">
                  <code style={{ fontSize: 12 }}>{g.game_id}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>
        Nota: el multiplicador define cuántos puntos vale ese juego (puntos base × multiplicador).
      </p>
    </section>
  );
}

function GameThumb({ name, imageUrl }: { name: string; imageUrl?: string }) {
  if (!imageUrl) {
    return (
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 10,
          border: "1px solid #ddd",
          display: "grid",
          placeItems: "center",
          fontSize: 10,
          fontWeight: 800,
          opacity: 0.6,
          userSelect: "none",
        }}
        title="Sin imagen"
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      loading="lazy"
      style={{
        width: 54,
        height: 54,
        borderRadius: 10,
        objectFit: "cover",
        border: "1px solid #ddd",
      }}
      onError={(e) => {
        // Si el link falla, mostramos un fallback sin romper la tabla
        const img = e.currentTarget;
        img.style.display = "none";
      }}
    />
  );
}

function TypeBadge({ type }: { type: string }) {
  const label =
    type === "heavy"
      ? "Pesado"
      : type === "medium"
      ? "Medio"
      : type === "filler_night"
      ? "Filler nocturno"
      : "Filler";

  return (
    <span
      style={{
        padding: "2px 10px",
        borderRadius: 999,
        border: "1px solid #ddd",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
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
