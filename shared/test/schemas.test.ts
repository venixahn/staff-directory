import { describe, expect, it } from "vitest"
import { databaseSchema, fieldDraftSchema, fieldSchema } from "../src/schemas"
import { createSeedDatabase } from "../src/seed"

describe("schemas", () => {
  it("accepts the seed database", () => {
    expect(databaseSchema.parse(createSeedDatabase()).employees).toHaveLength(8)
  })

  it("rejects a select field without options", () => {
    const result = fieldSchema.safeParse({
      id: "level",
      label: "Level",
      type: "select",
      required: false,
      builtin: false,
    })
    expect(result.success).toBe(false)
  })

  it("requires at least one column on a records field", () => {
    const draft = { label: "Certificates", type: "records", required: false }
    expect(fieldDraftSchema.safeParse(draft).success).toBe(false)
    expect(fieldDraftSchema.safeParse({ ...draft, columns: [{ label: "Name", type: "text" }] }).success).toBe(true)
  })

  it("rejects an empty field draft label", () => {
    expect(fieldDraftSchema.safeParse({ label: "  ", type: "text", required: false }).success).toBe(false)
  })
})
