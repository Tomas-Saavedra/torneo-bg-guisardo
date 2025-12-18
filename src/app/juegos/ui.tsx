"use client";

import { useMemo, useState } from "react";
import type { Game, MatchRow } from "@/lib/sheets";

type Props = {
  games: Game[];
  matches: MatchRow[];
};

type Order = "partidas" | "nombre";
type Filter = "todos" | "heavy" | "medium" | "filler";

function toNum(v: unknown, fallback = 1) {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default function JuegosUI({ games, matches }: Props) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");
  const [order, setOrder] = useState<Order>("partidas");

  const rows = useMemo(() => {
    const countByGame: Record<string, number> = {};

    const multByGame: Record<string, number> = {};
    const typeByGame: Record<string, string> = {};
    const imgByGame: Record<string, string | undefined> = {};
    const nameByGame: Record<string, string> = {};

    for (const g of games) {
      const gid = String(g.game_id ?? "").trim();
      if (!gid) continue;

      multByGame[gid] = toNum((g as any).multiplier, 1);
      typeByGame[gid] = String((g as any).type ?? "").trim().toLowerCase() || "filler";
      imgByGame[gid] = (g as any).image_url ?? undefined;
      nameByGame[gid] = String((g as any).name ?? gid);
    }

    for (const m of matches) {
      const gid = String((m as any).game_id ?? "").trim();
      if (!gid) continue;
      countByGame[gid] = (countByGame[gid] ?? 0) + 1;
    }

    const query = q.trim().toLowerCase();

    let list = games
      .map((g) => {
        const gid = String(g.game_id ?? "").trim();
        const mult = multByGame[gid] ?? 1;
        const type = typeByGame[gid] ?? "filler";
        const partidas = Number(countByGame[gid] ?? 0);

        return {
          ...g,
          gid,
          mult,
          type,
          partidas,
          img: imgByGame[gid],
          displayName: nameByGame[gid] ?? String((g as any).name ?? gid),
        };
      })
      .filter((g) => (query ? g.displayName.toLowerCase().includes(query) : true))
      .filter((g) => (filter === "todos" ? true : String(g.type).toLowerCase() === filter));

    list.sort((a, b) => {
      if (order === "nombre") return a.displayName.localeCompare(b.displayName);
      const bp = Number(b.partidas ?? 0);
      const ap = Number(a.partidas ?? 0);
      if (bp !== ap) return bp - ap;
      return a.displayName.localeCompare(b.displayName);
    });

    return list;
  }, [games, matches, q, filter, order]);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px" }}>
      <style jsx>{`
        .controls {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .search {
          flex: 1;
          min-width: 220px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        @media (max-width: 960px) {
          .grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
        .card {
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 12px;
          background: white;
          display: flex;
          gap: 12px;
          align-items: center;
          min-width: 0;
        }
        .img {
          width: 92px;
          height: 92px;
          border-radius: 12px;
          object-fit: cover;
          flex: 0 0 auto;
          background: #f3f3f3;
        }
        @media (max-width: 640px) {
          .img {
            width: 72px;
            height: 72px;
          }
        }
        .title {
          font-weight: 800;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .meta {
          opacity: 0.75;
        }
      `}</style>

      <h1 style={{ marginBottom: 12 }}>Juegos</h1>

      <div className="controls">
        <input
          className="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar juego..."
          style={{
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
          <option value="partidas">Orden: partidas</option>
          <option value="nombre">Orden: nombre</option>
        </select>
      </div>

      <div className="grid">
        {rows.map((g: any) => (
          <div key={g.gid} className="card">
            {g.img ? (
              <img className="img" src={g.img} alt={g.displayName} />
            ) : (
              <div className="img" />
            )}

            <div style={{ minWidth: 0 }}>
              <div className="title">{g.displayName}</div>
              <div className="meta">
                {(g.type ?? "filler").toLowerCase()} • x{g.mult ?? 1} • {g.partidas ?? 0} partidas
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
