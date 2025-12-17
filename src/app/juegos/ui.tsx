// src/app/juegos/ui.tsx
"use client";

import { useMemo, useState } from "react";

type GameLike = {
  game_id: string;
  name: string;
  type?: string; // heavy | medium | filler
  multiplier?: number;
  image_url?: string;
};

type MatchLike = {
  game_id?: string;
};

type Props = {
  games: GameLike[];
  matches: MatchLike[];
};

function toNum(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(String(v ?? "").trim());
  return Number.isFinite(n) ? n : fallback;
}

function normStr(v: unknown): string {
  return String(v ?? "").trim();
}

export default function JuegosUI({ games, matches }: Props) {
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "plays">("plays");

  const { rows, availableTypes } = useMemo(() => {
    const playsByGame: Record<string, number> = {};

    for (const m of matches) {
      const gid = normStr(m.game_id);
      if (!gid) continue;
      playsByGame[gid] = (playsByGame[gid] ?? 0) + 1;
    }

    const types = new Set<string>();
    for (const g of games) {
      if (g.type) types.add(g.type);
    }

    const out = games.map((g) => {
      const gid = normStr(g.game_id);
      return {
        game_id: gid,
        name: normStr(g.name),
        type: normStr(g.type),
        multiplier: toNum(g.multiplier, 1) || 1,
        image_url: normStr((g as any).image_url),
        plays: playsByGame[gid] ?? 0,
      };
    });

    return { rows: out, availableTypes: Array.from(types).sort() };
  }, [games, matches]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    let out = rows.filter((g) => {
      if (typeFilter !== "all" && (g.type || "") !== typeFilter) return false;
      if (!qq) return true;
      return (
        g.name.toLowerCase().includes(qq) ||
        g.game_id.toLowerCase().includes(qq) ||
        (g.type || "").toLowerCase().includes(qq)
      );
    });

    out.sort((a, b) => {
      if (sortBy === "plays") {
        return b.plays - a.plays || a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });

    return out;
  }, [rows, q, typeFilter, sortBy]);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      {/* Filtros */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar juego..."
          style={{
            flex: "1 1 260px",
            height: 38,
            padding: "0 12px",
            border: "1px solid #e6e6e6",
            borderRadius: 10,
          }}
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{
            height: 38,
            padding: "0 10px",
            border: "1px solid #e6e6e6",
            borderRadius: 10,
            background: "white",
          }}
        >
          <option value="all">Todos</option>
          {availableTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          style={{
            height: 38,
            padding: "0 10px",
            border: "1px solid #e6e6e6",
            borderRadius: 10,
            background: "white",
          }}
        >
          <option value="plays">Orden: partidas</option>
          <option value="name">Orden: nombre</option>
        </select>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 14,
        }}
      >
        {filtered.map((g) => (
          <div
            key={g.game_id}
            style={{
              border: "1px solid #eee",
              borderRadius: 14,
              padding: 14,
              background: "white",
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 12,
                  background: "#f6f6f6",
                  overflow: "hidden",
                  border: "1px solid #f0f0f0",
                  flex: "0 0 auto",
                }}
              >
                {g.image_url ? (
                  <img
                    src={g.image_url}
                    alt={g.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : null}
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {g.name}
                </div>
                <div style={{ opacity: 0.75, fontSize: 13 }}>
                  {g.type || "—"} • x{g.multiplier} • {g.plays} partidas
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ opacity: 0.7, marginTop: 16 }}>
          No hay juegos que coincidan.
        </div>
      )}
    </div>
  );
}
