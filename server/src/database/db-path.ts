import path from "node:path"

export const DB_PATH = "DB_PATH"

export function resolveDbPath(): string {
  return process.env.STAFF_DB_PATH ?? path.join(process.cwd(), "data", "db.json")
}
