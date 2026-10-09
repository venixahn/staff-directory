import { Effect } from "effect"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { DatabaseService } from "../../src/database/database.service"
import { createField, deleteField, updateField } from "../../src/fields/fields"

describe("field use cases", () => {
  let directory: string | null = null

  afterEach(async () => {
    if (directory) await rm(directory, { recursive: true, force: true })
    directory = null
  })

  it("appends a new field to the profile layout", async () => {
    const database = await openTemp()
    const created = await Effect.runPromise(
      createField(database, { label: "Nickname", type: "text", required: false }),
    )
    const data = await Effect.runPromise(database.read())
    expect(data.layouts.profile.fieldIds.at(-1)).toBe(created.id)
  })

  it("protects builtin fields from deletion and type changes", async () => {
    const database = await openTemp()
    const removed = await Effect.runPromise(Effect.either(deleteField(database, "firstName")))
    expect(removed._tag).toBe("Left")
    if (removed._tag === "Left") expect(removed.left._tag).toBe("BuiltinFieldProtected")
    const retyped = await Effect.runPromise(
      Effect.either(updateField(database, "email", { label: "Email", type: "text", required: true })),
    )
    expect(retyped._tag).toBe("Left")
    if (retyped._tag === "Left") expect(retyped.left._tag).toBe("InvalidField")
  })

  async function openTemp() {
    directory = await mkdtemp(path.join(tmpdir(), "staff-fields-unit-"))
    const database = new DatabaseService(path.join(directory, "db.json"))
    await database.onModuleInit()
    return database
  }
})