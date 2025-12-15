import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liga de Juegos de Mesa",
  description: "Resultados y ranking de la liga competitiva",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui" }}>
        {/* HEADER GLOBAL */}
        <header
          style={{
            borderBottom: "1px solid #e5e5e5",
            padding: "12px 16px",
            background: "#fafafa",
          }}
        >
          <nav
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <a href="/" style={linkStyle}>
              🏠 Inicio
            </a>
            <a href="/ranking" style={linkStyle}>
              🏆 Ranking
            </a>
            <a href="/jornadas" style={linkStyle}>
              📅 Jornadas
            </a>
            <a href="/juegos" style={linkStyle}>
            🎲 Juegos
            </a>
            <a href="/calendario" style={linkStyle}>
            🗓️ Calendario
            </a>
            {/* dejamos listo para después */}
            {/* <a href="/juegos" style={linkStyle}>🎲 Juegos</a> */}
            {/* <a href="/calendario" style={linkStyle}>🗓️ Calendario</a> */}
          </nav>
        </header>

        {/* CONTENIDO */}
        <main>{children}</main>
      </body>
    </html>
  );
}

const linkStyle: React.CSSProperties = {
  textDecoration: "none",
  fontWeight: 600,
  color: "#222",
};
