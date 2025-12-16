import Link from "next/link";
import { loadGames, loadMatches, loadPlayers } from "@/lib/sheets";
import GamesClient from "./ui";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function JuegosPage() {
  const [games, matches, players] = await Promise.all([
    loadGames(),
    loadMatches(),
    loadPlayers(),
  ]);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
      <nav style={{ marginBottom: 12 }}>
        <Link href="/">← Volver al inicio</Link>
      </nav>

      <GamesClient
        games={games}
        matches={matches}
        players={players}
      />
    </main>
  );
}
