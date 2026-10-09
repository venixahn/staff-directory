import { defineConfig } from "vitest/config"

export default defineConfig({
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
      },
    },
  },
  test: {
    environment: "node",
    include: ["test/api/**/*.test.ts"],
    testTimeout: 20000,
    hookTimeout: 20000,
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage/integration",
      include: ["src/**/*.ts"],
    },
  },
})
