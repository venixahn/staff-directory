import { describe, expect, it } from "vitest"
import { createSeedDatabase } from "../src/seed"
import { employeeValueMessage } from "../src/values"

describe("employee values", () => {
  const fields = createSeedDatabase().fields

  it("requires first name and a real email", () => {
    expect(employeeValueMessage(fields, { lastName: "Lovelace", email: "ada@example.com" })).toBe(
      "First name is required",
    )
    expect(
      employeeValueMessage(fields, {
        firstName: "Ada",
        lastName: "Lovelace",
        email: "not-an-email",
        status: "Active",
      }),
    ).toBe("Email must be an email")
  })

  it("rejects unknown fields and status values outside the options", () => {
    expect(employeeValueMessage(fields, full({ nickname: "A" }))).toBe("Unknown field nickname")
    expect(employeeValueMessage(fields, full({ status: "Away" }))).toBe("Status must be one of the options")
  })
})

function full(extra: Record<string, string>): Record<string, string> {
  return {
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    status: "Active",
    ...extra,
  }
}
