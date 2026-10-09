import "reflect-metadata"
import { rm } from "node:fs/promises"
import { createApp } from "./create-app"
import { resolveDbPath } from "./database/db-path"

async function bootstrap() {
  const dbPath = resolveDbPath()
  if (process.env.STAFF_DB_FRESH === "1") await rm(dbPath, { force: true })
  const app = await createApp(dbPath)
  await app.listen(Number(process.env.STAFF_PORT ?? 3000))
}

void bootstrap()
