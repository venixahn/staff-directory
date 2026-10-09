import { describe, expect, it } from "vitest"
import type { EmployeeValues } from "../src/schemas"
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

  it("accepts list entries for records fields and checks their shape and columns", () => {
    const education = [{ school: "Vassar College", from: "1924-09-01" }]
    expect(employeeValueMessage(fields, full({ education }))).toBeNull()
    expect(employeeValueMessage(fields, full({ education: "Vassar" }))).toBe("Education must be a list of entries")
    expect(employeeValueMessage(fields, full({ office: [] }))).toBe("Office must be text")
    expect(employeeValueMessage(fields, full({ education: [{ grade: "A" }] }))).toBe("Education has no column grade")
  })

  it("treats a required records field with only blank entries as missing", () => {
    const required = fields.map((field) => (field.id === "family" ? { ...field, required: true } : field))
    expect(employeeValueMessage(required, full({ family: [{ name: " " }] }))).toBe("Family members is required")
    expect(employeeValueMessage(required, full({ family: [{ name: "Byron King" }] }))).toBeNull()
  })
})

function full(extra: EmployeeValues): EmployeeValues {
  return {
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    status: "Active",
    ...extra,
  }
}
