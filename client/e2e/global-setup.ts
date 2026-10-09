import { rm } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const dbPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../server/data/e2e.json")

export default async function globalSetup() {
  await rm(dbPath, { force: true })
}

export { dbPath }
