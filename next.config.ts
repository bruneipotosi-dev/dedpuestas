import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // No queremos que `next dev` le agregue un bloque autogenerado a nuestro
  // CLAUDE.md (curado a mano para este proyecto).
  agentRules: false,
};

export default nextConfig;
