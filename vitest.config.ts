import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server-only": path.resolve(__dirname, "./tests/server-only-stub.ts"),
    },
  },
  test: {
    testTimeout: 60_000,
    hookTimeout: 60_000,
    setupFiles: ["./tests/setup.ts"],
    // Todos los archivos de test comparten el mismo contenedor de Postgres
    // (levantado una vez en tests/setup.ts), así que corren secuenciales.
    fileParallelism: false,
  },
});
