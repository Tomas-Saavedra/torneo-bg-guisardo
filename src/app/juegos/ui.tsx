"use client";

import { useMemo, useState } from "react";
import type { Game } from "@/lib/sheets";

type Filter = "all" | "con_gente" | "sin_gente";

export default function GamesClient({ initialGames }: { initialGames: Game[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const games = useMemo(() => {
    const q = query.trim().toLowerCase();

    const hasPlayers = (g: Game) =>
      Boolean(g.p1 || g.p2 || g.p3 || g.p4 || g.p5);

    return initialGames
      .filter((g) => {
        if (filter === "con_gente") return hasPlayers(g);
        if (filter === "sin_gente") return !hasPlayers(g);
        return true;
      })
      .filter((g) => {
        if (!q) return true;
        return (
          g.game.toLowerCase().includes(q) ||
          g.date.toLowerCase().includes(q) ||
          [g.p1, g.p2, g.p3, g.p4, g.p5]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q)
        );
      })
      .sort((a, b) => a.game.localeCompare(b.game));
  }, [initialGames, query, filter]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
        Juegos
      </h1>

      <p style={{ opacity: 0.75, marginBottom: 18 }}>
        Catálogo de juegos (según tu Sheet). Podés filtrar por nombre / fecha /
        jugadores.
      </p>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar (ej: catan, 2025-12-20, pedro...)"
          style={{
            flex: "1 1 320px",
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: 10,
          }}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          style={{
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: 10,
          }}
        >
          <option value="all">Todos</option>
          <option value="con_gente">Con gente cargada</option>
          <option value="sin_gente">Sin gente (vacíos)</option>
        </select>

        <div style={{ opacity: 0.8 }}>
          <b>{games.length}</b> juegos
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 760,
          }}
        >
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th style={th}>Juego</th>
              <th style={th}>Fecha</th>
              <th style={th}>Sesión</th>
              <th style={th}>Hora</th>
              <th style={th}>Jugadores</th>
            </tr>
          </thead>
          <tbody>
            {games.map((g, idx) => {
              const players = [g.p1, g.p2, g.p3, g.p4, g.p5].filter(Boolean);

              return (
                <tr key={`${g.game}-${g.date}-${g.session}-${idx}`}>
                  <td style={tdStrong}>{g.game}</td>
                  <td style={td}>{g.date || "-"}</td>
                  <td style={td}>{g.session || "-"}</td>
                  <td style={td}>{g.time || "-"}</td>
                  <td style={td}>
                    {players.length ? players.join(", ") : <i>—</i>}
                  </td>
                </tr>
              );
            })}
            {!games.length && (
              <tr>
                <td style={td} colSpan={5}>
                  <i>No hay juegos para mostrar (revisá filtros o el Sheet).</i>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #eee",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #f2f2f2",
  verticalAlign: "top",
};

const tdStrong: React.CSSProperties = {
  ...td,
  fontWeight: 600,
};
