import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL("./", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    css: true,
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "./coverage",
      include: ["app/api/**/*.{ts,tsx}", "app/auth/callback/route.ts", "app/login/actions.ts", "hooks/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}", "proxy.ts"],
      exclude: ["**/*.test.{ts,tsx}", "**/*.d.ts", "lib/database.types.ts", "lib/types.ts"],
      thresholds: {
        branches: 65,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
