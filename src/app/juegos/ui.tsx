"use client";

import { useMemo, useState } from "react";
import type { Game, MatchRow } from "@/lib/sheets";

type Props = {
  games: Game[];
  matches: MatchRow[];
};

type Order = "puntos" | "nombre";
type Filter = "todos" | "heavy" | "medium" | "filler";

function toNum(v: unknown, fallback = 1) {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default function JuegosUI({ games, matches }: Props) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");
  const [order, setOrder] = useState<Order>("puntos");

  const rows = useMemo(() => {
    const pointsByGame: Record<string, number> = {};
    const countByGame: Record<string, number> = {};

    const multByGame: Record<string, number> = {};
    const typeByGame: Record<string, string> = {};
    const imgByGame: Record<string, string | undefined> = {};
    const nameByGame: Record<string, string> = {};

    for (const g of games) {
      multByGame[g.game_id] = toNum(g.multiplier, 1);
      typeByGame[g.game_id] = String(g.type ?? "").trim();
      imgByGame[g.game_id] = g.image_url;
      nameByGame[g.game_id] = g.name;
    }

    for (const m of matches) {
      const gid = String(m.game_id ?? "").trim();
      if (!gid) continue;
      countByGame[gid] = (countByGame[gid] ?? 0) + 1;
      // (Si querés 0 puntos acá, dejalo; en tu screenshot ya vuelve a estar bien)
      pointsByGame[gid] = (pointsByGame[gid] ?? 0) + 0;
    }

    const query = q.trim().toLowerCase();

    let list = games
      .map((g) => {
        const gid = g.game_id;
        const mult = multByGame[gid] ?? 1;
        const type = typeByGame[gid] || "filler";
        const partidas = countByGame[gid] ?? 0;
        const pts = pointsByGame[gid] ?? 0;

        return {
          ...g,
          mult,
          type,
          partidas,
          pts,
          img: imgByGame[gid],
          displayName: nameByGame[gid] ?? g.name,
        };
      })
      .filter((g) => (query ? g.displayName.toLowerCase().includes(query) : true))
      .filter((g) => (filter === "todos" ? true : String(g.type).toLowerCase() === filter));

    list.sort((a, b) => {
      if (order === "nombre") return a.displayName.localeCompare(b.displayName);
      return (b.pts ?? 0) - (a.pts ?? 0);
    });

    return list;
  }, [games, matches, q, filter, order]);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ marginBottom: 12 }}>Juegos</h1>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar juego..."
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: 10,
          }}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 10 }}
        >
          <option value="todos">Todos</option>
          <option value="heavy">heavy</option>
          <option value="medium">medium</option>
          <option value="filler">filler</option>
        </select>

        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as Order)}
          style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 10 }}
        >
          <option value="puntos">Orden: puntos</option>
          <option value="nombre">Orden: nombre</option>
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
        {rows.map((g) => (
          <div
            key={g.game_id}
            style={{
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 12,
              background: "white",
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            {g.image_url ? (
              <img
                src={g.image_url}
                alt={g.name}
                width={64}
                height={64}
                style={{ borderRadius: 12, objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: 12, background: "#f3f3f3" }} />
            )}

            <div>
              <div style={{ fontWeight: 800 }}>{g.name}</div>
              <div style={{ opacity: 0.75 }}>
                {g.type ?? "filler"} • x{g.multiplier ?? 1} • {g.partidas ?? 0} partidas
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
