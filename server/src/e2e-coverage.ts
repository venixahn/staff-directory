import type { INestApplication } from "@nestjs/common"
import v8 from "node:v8"

export function mountE2eCoverage(app: INestApplication) {
  if (process.env.E2E_COVERAGE !== "1") return
  const server = expressApp(app)
  server.get("/api/__e2e_coverage__", (_req, res) => {
    v8.takeCoverage()
    res.json({ ok: true })
  })
}

interface ExpressLike {
  get(path: string, handler: (req: unknown, res: CoverageResponse) => void): void
}

interface CoverageResponse {
  json(body: unknown): void
}

function expressApp(app: INestApplication) {
  return app.getHttpAdapter().getInstance() as ExpressLike
}
