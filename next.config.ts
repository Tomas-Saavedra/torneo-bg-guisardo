import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No mezclar webpack con turbopack en Next 16
  // (esto es lo que te estaba rompiendo el dev server)
  productionBrowserSourceMaps: false,

  // Para silenciar el warning/error de "mixed config"
  turbopack: {},
};

export default nextConfig;
