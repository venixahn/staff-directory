import type { INestApplication } from "@nestjs/common"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import request from "supertest"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { createApp } from "../../src/create-app"

describe("fields API", () => {
  let app: INestApplication
  let directory: string

  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), "staff-fields-"))
    app = await createApp(path.join(directory, "db.json"), true)
  })

  afterEach(async () => {
    await app.close()
    await rm(directory, { recursive: true, force: true })
  })

  it("adds a custom field to the form order and the profile layout", async () => {
    const created = await request(app.getHttpServer())
      .post("/api/fields")
      .send({ label: "Nickname", type: "text", required: false })
      .expect(201)
    expect(created.body.id).toBe("nickname")
    const fields = await request(app.getHttpServer()).get("/api/fields").expect(200)
    expect(fields.body.at(-1).label).toBe("Nickname")
  })

  it("refuses to delete a builtin field", async () => {
    await request(app.getHttpServer()).delete("/api/fields/email").expect(409)
  })

  it("drops a custom field and the values stored on employees", async () => {
    await request(app.getHttpServer())
      .post("/api/fields")
      .send({ label: "Nickname", type: "text", required: false })
      .expect(201)
    await request(app.getHttpServer())
      .patch("/api/employees/emp-ada")
      .send({ values: { nickname: "A.L." } })
      .expect(200)
    await request(app.getHttpServer()).delete("/api/fields/nickname").expect(200)
    const employee = await request(app.getHttpServer()).get("/api/employees/emp-ada").expect(200)
    expect(employee.body.values.nickname).toBeUndefined()
  })

  it("reorders fields when every id is listed once", async () => {
    const current = await request(app.getHttpServer()).get("/api/fields").expect(200)
    const ids = current.body.map((field: { id: string }) => field.id).reverse()
    const ordered = await request(app.getHttpServer()).put("/api/fields/order").send({ ids }).expect(200)
    expect(ordered.body.map((field: { id: string }) => field.id)).toEqual(ids)
    await request(app.getHttpServer()).put("/api/fields/order").send({ ids: ["email"] }).expect(400)
  })
})