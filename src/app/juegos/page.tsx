import { loadGames } from "@/lib/sheets";
import GamesClient from "./ui";

export default async function JuegosPage() {
  const games = await loadGames();

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Juegos</h1>
      <p style={{ opacity: 0.8 }}>
        Catálogo de juegos disponibles. Las imágenes salen de la columna <b>image_url</b> en Google Sheets.
      </p>

      <GamesClient initialGames={games} />
    </main>
  );
}
