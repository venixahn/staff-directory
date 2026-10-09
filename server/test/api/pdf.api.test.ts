import type { INestApplication } from "@nestjs/common"
import { mkdtemp, rm } from "node:fs/promises"
import type { IncomingMessage } from "node:http"
import { tmpdir } from "node:os"
import path from "node:path"
import request from "supertest"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { createApp } from "../../src/create-app"

describe("pdf API", () => {
  let app: INestApplication
  let directory: string

  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), "staff-pdf-"))
    app = await createApp(path.join(directory, "db.json"), true)
  })

  afterEach(async () => {
    await app.close()
    await rm(directory, { recursive: true, force: true })
  })

  it("downloads one profile and a filtered report", async () => {
    const profile = await pdfRequest(`/api/pdf/profile/emp-ada`)
    expect(profile.headers["content-type"]).toContain("application/pdf")
    expect(profile.body.subarray(0, 4).toString()).toBe("%PDF")
    const report = await pdfRequest("/api/pdf/report?q=Research")
    expect(report.body.subarray(0, 4).toString()).toBe("%PDF")
    await request(app.getHttpServer()).post("/api/pdf/profile/missing").expect(404)
  })

  function pdfRequest(url: string) {
    return request(app.getHttpServer()).post(url).buffer(true).parse(binaryParser).expect(200)
  }
})

function binaryParser(res: IncomingMessage, callback: (error: Error | null, body: Buffer) => void) {
  const chunks: Buffer[] = []
  res.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)))
  res.on("end", () => callback(null, Buffer.concat(chunks)))
}
