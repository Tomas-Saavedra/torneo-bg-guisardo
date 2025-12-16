import { parseCsv } from "./csv";

async function fetchCsv(envName: string): Promise<any[]> {
  const url = process.env[envName];

  // 🔒 Guardrail absoluto
  if (!url || typeof url !== "string") {
    console.error(`❌ Missing env var: ${envName}`);
    return [];
  }

  try {
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      console.error(`❌ Fetch failed for ${envName}: ${res.status}`);
      return [];
    }

    const text = await res.text();
    return parseCsv(text);
  } catch (err) {
    console.error(`❌ Error fetching ${envName}`, err);
    return [];
  }
}

export async function loadPlayers() {
  return fetchCsv("SHEETS_PLAYERS_CSV_URL");
}

export async function loadGames() {
  return fetchCsv("SHEETS_GAMES_CSV_URL");
}

export async function loadSchedule() {
  return fetchCsv("SHEETS_SCHEDULE_CSV_URL");
}

export async function loadMatches() {
  return fetchCsv("SHEETS_MATCHES_CSV_URL");
}
