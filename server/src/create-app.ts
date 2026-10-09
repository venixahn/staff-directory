import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { resolveDbPath } from "./database/db-path"

export async function createApp(dbPath = resolveDbPath(), silent = false) {
  const app = await NestFactory.create(AppModule.register(dbPath), silent ? { logger: false } : {})
  app.setGlobalPrefix("api")
  await app.init()
  return app
}
