"use client";

import { useMemo, useState } from "react";
import type { Game } from "@/lib/sheets";

export default function GamesClient({
  initialGames,
}: {
  initialGames: Game[];
}) {
  const [query, setQuery] = useState("");

  const games = useMemo(() => {
    const q = query.trim().toLowerCase();

    return initialGames
      .filter(g =>
        q ? g.name.toLowerCase().includes(q) : true
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [initialGames, query]);

  return (
    <div style={{ maxWidth: 600 }}>
      <input
        placeholder="Buscar juego..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />

      <ul>
        {games.map(g => (
          <li key={g.id}>{g.name}</li>
        ))}
      </ul>
    </div>
  );
}
