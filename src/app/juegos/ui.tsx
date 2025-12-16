"use client";

import { useMemo, useState } from "react";
import type { Game, MatchRow, Player } from "@/lib/sheets";

type Props = {
  games: Game[];
  matches: MatchRow[];
  players: Player[];
};

function safe(v?: string) {
  return (v ?? "").trim();
}

export default function JuegosClient({ games, matches, players }: Props) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string>("all");

  const playerNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of players) {
      m.set(p.id.toLowerCase(), p.name.toLowerCase());
      m.set(p.name.toLowerCase(), p.name.toLowerCase());
    }
    return m;
  }, [players]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Si el usuario escribe un nombre, lo buscamos en players y después matcheamos partidos.
    const qPlayerIds = new Set<string>();
    if (q) {
      for (const p of players) {
        const id = p.id.toLowerCase();
        const name = p.name.toLowerCase();
        if (id.includes(q) || name.includes(q)) qPlayerIds.add(p.id);
      }
    }

    // Map game_id -> lista de jugadores (ids) que aparecen en partidas de ese juego
    const gamePlayers = new Map<string, Set<string>>();
    for (const m of matches) {
      const gid = safe(m.game_id);
      if (!gid) continue;

      const set = gamePlayers.get(gid) ?? new Set<string>();
      for (const pid of [m.p1, m.p2, m.p3, m.p4, m.p5]) {
        const v = safe(pid);
        if (v) set.add(v);
      }
      gamePlayers.set(gid, set);
    }

    return games
      .filter((g) => (type === "all" ? true : safe(g.type).toLowerCase() === type))
      .filter((g) => {
        if (!q) return true;

        const nameOk = g.name.toLowerCase().includes(q) || g.game_id.toLowerCase().includes(q);

        // Buscar por fecha/sesión no aplica acá porque son datos de matches; lo dejamos por jugadores y texto.
        if (nameOk) return true;

        // Si q coincide con algún jugador, ver si ese jugador jugó este juego alguna vez
        if (qPlayerIds.size > 0) {
          const set = gamePlayers.get(g.game_id);
          if (!set) return false;
          for (const pid of qPlayerIds) if (set.has(pid)) return true;
          return false;
        }

        // Si no coincide con nombre/juego ni con jugador conocido, no matchea
        return false;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [games, matches, players, query, type]);

  const types = useMemo(() => {
    const set = new Set<string>();
    for (const g of games) {
      const t = safe(g.type).toLowerCase();
      if (t) set.add(t);
    }
    return ["all", ...Array.from(set).sort()];
  }, [games]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <h1>Juegos</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>
        Catálogo de juegos disponibles. Las imágenes salen de la columna <b>image_url</b> en Google Sheets.
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar (ej: catan, brass, saave, pedro...)"
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8 }}
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t === "all" ? "Todos" : t}
            </option>
          ))}
        </select>

        <span style={{ opacity: 0.7 }}>{filtered.length} juegos</span>
      </div>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
        {filtered.map((g) => (
          <div
            key={g.game_id}
            style={{
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 12,
              background: "white",
            }}
          >
            {g.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={g.image_url}
                alt={g.name}
                style={{
                  width: "100%",
                  height: 140,
                  objectFit: "cover",
                  borderRadius: 10,
                  border: "1px solid #f1f1f1",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 140,
                  borderRadius: 10,
                  border: "1px dashed #ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.7,
                }}
              >
                Sin imagen
              </div>
            )}

            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 700 }}>{g.name}</div>
              <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>
                id: {g.game_id}
                {g.type ? ` • ${g.type}` : ""}
              </div>
              <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>
                x{g.multiplier}
                {typeof g.min_p === "number" ? ` • min ${g.min_p}` : ""}
                {typeof g.max_p === "number" ? ` • max ${g.max_p}` : ""}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ marginTop: 18, fontStyle: "italic", opacity: 0.75 }}>
          No hay juegos para mostrar (revisá filtros o el Sheet).
        </p>
      )}
    </div>
  );
}
