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

  it("rejects an empty field draft label", () => {
    expect(fieldDraftSchema.safeParse({ label: "  ", type: "text", required: false }).success).toBe(false)
  })
})
