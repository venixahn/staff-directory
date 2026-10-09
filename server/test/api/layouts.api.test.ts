import type { INestApplication } from "@nestjs/common"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import request from "supertest"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { createApp } from "../../src/create-app"

describe("layouts API", () => {
  let app: INestApplication
  let directory: string

  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), "staff-layouts-"))
    app = await createApp(path.join(directory, "db.json"), true)
  })

  afterEach(async () => {
    await app.close()
    await rm(directory, { recursive: true, force: true })
  })

  it("saves a profile title and rejects an unknown field", async () => {
    const current = await request(app.getHttpServer()).get("/api/layouts/profile").expect(200)
    const saved = await request(app.getHttpServer())
      .put("/api/layouts/profile")
      .send({ ...current.body, title: "People" })
      .expect(200)
    expect(saved.body.title).toBe("People")
    const again = await request(app.getHttpServer()).get("/api/layouts/profile").expect(200)
    expect(again.body.title).toBe("People")
    await request(app.getHttpServer())
      .put("/api/layouts/profile")
      .send({ ...current.body, fieldIds: ["missing"] })
      .expect(400)
  })

  it("saves report columns, sort, and group-by", async () => {
    const current = await request(app.getHttpServer()).get("/api/layouts/report").expect(200)
    const saved = await request(app.getHttpServer())
      .put("/api/layouts/report")
      .send({
        ...current.body,
        title: "Roster",
        columnIds: ["lastName", "department"],
        sortFieldId: "lastName",
        sortDirection: "desc",
        groupByFieldId: "department",
      })
      .expect(200)
    expect(saved.body).toMatchObject({
      title: "Roster",
      columnIds: ["lastName", "department"],
      sortDirection: "desc",
      groupByFieldId: "department",
    })
  })
})