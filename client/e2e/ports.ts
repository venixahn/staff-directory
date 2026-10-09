import path from "node:path"
import { fileURLToPath } from "node:url"

export const apiPort = 3010
export const uiPort = 5174
export const dbPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../server/data/e2e.json")
