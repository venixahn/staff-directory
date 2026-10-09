import { defineConfig } from "@playwright/test"
import { dbPath } from "./e2e/global-setup"

export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  fullyParallel: false,
  globalSetup: "./e2e/global-setup.ts",
  use: { baseURL: "http://127.0.0.1:5173" },
  webServer: [
    {
      command: "npm run start -w server",
      cwd: "..",
      url: "http://127.0.0.1:3000/api/employees",
      reuseExistingServer: false,
      timeout: 120_000,
      env: { STAFF_DB_PATH: dbPath },
    },
    {
      command: "npm run dev -w client",
      cwd: "..",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})
