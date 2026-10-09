import type { INestApplication } from "@nestjs/common"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import request from "supertest"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { createApp } from "../../src/create-app"

describe("records fields API", () => {
  let app: INestApplication
  let directory: string

  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), "staff-records-"))
    app = await createApp(path.join(directory, "db.json"), true)
  })

  afterEach(async () => {
    await app.close()
    await rm(directory, { recursive: true, force: true })
  })

  const server = () => app.getHttpServer()

  it("creates a records field with column ids and stores entries on an employee", async () => {
    const created = await request(server())
      .post("/api/fields")
      .send({
        label: "Certificates",
        type: "records",
        required: false,
        columns: [
          { label: "Name", type: "text" },
          { label: "Issued on", type: "date" },
        ],
      })
      .expect(201)
    expect(created.body.columns.map((column: { id: string }) => column.id)).toEqual(["name", "issued-on"])

    const certificates = [{ name: "Pilot licence", "issued-on": "1931-04-02" }]
    const saved = await request(server()).patch("/api/employees/emp-ada").send({ values: { certificates } }).expect(200)
    expect(saved.body.values.certificates).toEqual(certificates)
    const found = await request(server()).get("/api/employees?q=pilot").expect(200)
    expect(found.body.map((employee: { id: string }) => employee.id)).toEqual(["emp-ada"])
  })

  it("rejects entries for unknown columns and text where a list belongs", async () => {
    await request(server())
      .patch("/api/employees/emp-ada")
      .send({ values: { education: [{ grade: "A" }] } })
      .expect(400)
    await request(server())
      .patch("/api/employees/emp-ada")
      .send({ values: { education: "Home tutoring" } })
      .expect(400)
  })

  it("keeps entries for kept columns and drops removed columns when a field changes", async () => {
    const fields = await request(server()).get("/api/fields").expect(200)
    const family = fields.body.find((field: { id: string }) => field.id === "family")
    await request(server())
      .patch("/api/fields/family")
      .send({
        label: "Family",
        type: "records",
        required: false,
        columns: [family.columns[0], { label: "Phone", type: "text" }],
      })
      .expect(200)
    const ada = await request(server()).get("/api/employees/emp-ada").expect(200)
    expect(ada.body.values.family).toEqual([{ name: "Byron King" }])
  })

  it("refuses a records field as a report column", async () => {
    const report = await request(server()).get("/api/layouts/report").expect(200)
    await request(server())
      .put("/api/layouts/report")
      .send({ ...report.body, columnIds: [...report.body.columnIds, "education"] })
      .expect(400)
  })

  it("renders profile sections into the PDF", async () => {
    const response = await request(server())
      .post("/api/pdf/profile/emp-grace")
      .buffer(true)
      .parse((res, callback) => {
        const chunks: Buffer[] = []
        res.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)))
        res.on("end", () => callback(null, Buffer.concat(chunks)))
      })
      .expect(200)
    expect((response.body as Buffer).subarray(0, 4).toString()).toBe("%PDF")
  })
})
