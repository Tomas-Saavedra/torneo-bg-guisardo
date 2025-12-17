// src/app/juegos/page.tsx
import JuegosUI from "./ui";
import { loadGames, loadMatches } from "@/lib/sheets";

export default async function JuegosPage() {
  const [games, matches] = await Promise.all([loadGames(), loadMatches()]);

  return (
    <main>
      <h1 style={{ maxWidth: 980, margin: "0 auto", padding: "16px 16px 0", fontSize: 28, fontWeight: 800 }}>
        Juegos
      </h1>
      <JuegosUI games={games as any} matches={matches as any} />
    </main>
  );
}
