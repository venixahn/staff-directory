import "reflect-metadata"
import { createApp } from "./create-app"
import { resolveDbPath } from "./database/db-path"

async function bootstrap() {
  const app = await createApp(resolveDbPath())
  await app.listen(3000)
}

void bootstrap()
