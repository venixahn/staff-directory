import { spawnSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const clientDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const serverDir = path.resolve(clientDir, "../server")

function run(command, args, options) {
  return spawnSync(command, args, {
    cwd: options.cwd,
    stdio: "inherit",
    shell: true,
    env: options.env ?? process.env,
  })
}

const playwright = run("npx", ["playwright", "test"], {
  cwd: clientDir,
  env: { ...process.env, E2E_COVERAGE: "1" },
})
const browserReport = run("npx", [
  "nyc",
  "report",
  "--temp-dir",
  "coverage/e2e/.nyc_output",
  "--report-dir",
  "coverage/e2e",
  "--reporter=text",
  "--reporter=html",
], { cwd: clientDir })
const serverReport = run("npx", [
  "c8",
  "report",
  "--reporter=text",
  "--reporter=html",
  "--reports-dir",
  "coverage/e2e",
  "--temp-directory",
  "coverage/e2e/tmp",
  "--include",
  "src/**/*.ts",
], { cwd: serverDir })
if ((playwright.status ?? 1) !== 0) process.exit(playwright.status ?? 1)
if ((browserReport.status ?? 1) !== 0) process.exit(browserReport.status ?? 1)
if ((serverReport.status ?? 1) !== 0) process.exit(serverReport.status ?? 1)
