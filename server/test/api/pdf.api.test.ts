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

  it("renders an unsaved layout and leaves the saved one alone", async () => {
    const saved = await request(app.getHttpServer()).get("/api/layouts/profile").expect(200)
    const layout = { ...saved.body, title: "Draft", columns: 2, labelStyle: "stacked", pageSize: "LETTER" }
    const profile = await pdfRequest("/api/pdf/profile/emp-ada", { layout })
    expect(profile.body.subarray(0, 4).toString()).toBe("%PDF")
    const after = await request(app.getHttpServer()).get("/api/layouts/profile").expect(200)
    expect(after.body.title).toBe(saved.body.title)

    const report = await request(app.getHttpServer()).get("/api/layouts/report").expect(200)
    const compact = await pdfRequest("/api/pdf/report?q=Research", { layout: { ...report.body, density: "compact" } })
    expect(compact.body.subarray(0, 4).toString()).toBe("%PDF")

    await request(app.getHttpServer())
      .post("/api/pdf/profile/emp-ada")
      .send({ layout: { ...layout, fieldIds: ["missing"] } })
      .expect(400)
  })

  function pdfRequest(url: string, body?: object) {
    const call = request(app.getHttpServer()).post(url)
    return (body ? call.send(body) : call).buffer(true).parse(binaryParser).expect(200)
  }
})

function binaryParser(res: IncomingMessage, callback: (error: Error | null, body: Buffer) => void) {
  const chunks: Buffer[] = []
  res.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)))
  res.on("end", () => callback(null, Buffer.concat(chunks)))
}
