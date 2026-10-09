import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { resolveDbPath } from "./database/db-path"
import { mountE2eCoverage } from "./e2e-coverage"

export async function createApp(dbPath = resolveDbPath(), silent = false) {
  const app = await NestFactory.create(AppModule.register(dbPath), silent ? { logger: false } : {})
  app.setGlobalPrefix("api")
  mountE2eCoverage(app)
  await app.init()
  return app
}
