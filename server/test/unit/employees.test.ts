import { Effect } from "effect"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { DatabaseService } from "../../src/database/database.service"
import { createEmployee, getEmployee } from "../../src/employees/employees"

describe("employee use cases", () => {
  let directory: string | null = null

  afterEach(async () => {
    if (directory) await rm(directory, { recursive: true, force: true })
    directory = null
  })

  it("fails with EmployeeNotFound when the id is missing", async () => {
    const database = await openTemp()
    const result = await Effect.runPromise(Effect.either(getEmployee(database, "missing")))
    expect(result._tag).toBe("Left")
    if (result._tag === "Left") expect(result.left._tag).toBe("EmployeeNotFound")
  })

  it("fails with InvalidField when the email is not an email", async () => {
    const database = await openTemp()
    const result = await Effect.runPromise(
      Effect.either(
        createEmployee(database, {
          firstName: "Ada",
          lastName: "Lovelace",
          email: "nope",
          status: "Active",
        }),
      ),
    )
    expect(result._tag).toBe("Left")
    if (result._tag === "Left") expect(result.left._tag).toBe("InvalidField")
  })

  async function openTemp() {
    directory = await mkdtemp(path.join(tmpdir(), "staff-unit-"))
    const database = new DatabaseService(path.join(directory, "db.json"))
    await database.onModuleInit()
    return database
  }
})
