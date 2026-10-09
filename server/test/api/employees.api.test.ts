import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import request from "supertest"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import type { INestApplication } from "@nestjs/common"
import { createApp } from "../../src/create-app"

describe("employees API", () => {
  let app: INestApplication
  let directory: string

  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), "staff-api-"))
    app = await createApp(path.join(directory, "db.json"), true)
  })

  afterEach(async () => {
    await app.close()
    await rm(directory, { recursive: true, force: true })
  })

  it("lists seeded employees and filters by department", async () => {
    const all = await request(app.getHttpServer()).get("/api/employees").expect(200)
    expect(all.body).toHaveLength(8)
    const research = await request(app.getHttpServer()).get("/api/employees").query({ q: "Research" }).expect(200)
    expect(research.body.map((employee: { id: string }) => employee.id).sort()).toEqual([
      "emp-alan",
      "emp-barbara",
      "emp-donald",
      "emp-katherine",
    ])
  })

  it("reads one employee and returns 404 when the id is missing", async () => {
    const found = await request(app.getHttpServer()).get("/api/employees/emp-ada").expect(200)
    expect(found.body.values.firstName).toBe("Ada")
    await request(app.getHttpServer()).get("/api/employees/missing").expect(404)
  })

  it("creates, updates, and deletes an employee", async () => {
    const created = await request(app.getHttpServer())
      .post("/api/employees")
      .send({
        values: {
          firstName: "Edsger",
          lastName: "Dijkstra",
          email: "edsger@example.com",
          status: "Active",
          department: "Research",
        },
      })
      .expect(201)
    const id = created.body.id as string
    expect(id).toBeTruthy()

    const updated = await request(app.getHttpServer())
      .patch(`/api/employees/${id}`)
      .send({ values: { jobTitle: "Professor" } })
      .expect(200)
    expect(updated.body.values.jobTitle).toBe("Professor")

    await request(app.getHttpServer()).delete(`/api/employees/${id}`).expect(200)
    await request(app.getHttpServer()).get(`/api/employees/${id}`).expect(404)
  })

  it("rejects a create body that fails validation", async () => {
    await request(app.getHttpServer())
      .post("/api/employees")
      .send({ values: { firstName: "Ada", lastName: "Lovelace", email: "bad", status: "Active" } })
      .expect(400)
  })
})
