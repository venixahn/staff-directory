import { defineConfig } from "@playwright/test"
import { apiPort, dbPath, uiPort } from "./e2e/ports"

const e2eCoverage = process.env.E2E_COVERAGE === "1"

export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  fullyParallel: false,
  globalTeardown: "./e2e/global-teardown.ts",
  use: { baseURL: `http://127.0.0.1:${uiPort}` },
  webServer: [
    {
      command: e2eCoverage
        ? "npx c8 --reporter=text --reporter=html --reports-dir coverage/e2e npm run start"
        : "npm run start -w server",
      cwd: e2eCoverage ? "../server" : "..",
      url: `http://127.0.0.1:${apiPort}/api/employees`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: { STAFF_DB_PATH: dbPath, STAFF_DB_FRESH: "1", STAFF_PORT: String(apiPort) },
    },
    {
      command: `npm run dev -w client -- --port ${uiPort}`,
      cwd: "..",
      url: `http://127.0.0.1:${uiPort}`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        STAFF_PORT: String(apiPort),
        ...(e2eCoverage ? { VITE_COVERAGE: "true" } : {}),
      },
    },
  ],
})
