import { describe, expect, it } from "vitest"
import { createSeedDatabase } from "../src/seed"
import { filterEmployees } from "../src/search"

describe("search", () => {
  const database = createSeedDatabase()

  it("returns everyone for a blank query", () => {
    expect(filterEmployees(database.employees, database.fields, "  ")).toHaveLength(8)
  })

  it("matches department text and ignores hire dates", () => {
    const found = filterEmployees(database.employees, database.fields, "research")
    expect(found.map((employee) => employee.id).sort()).toEqual([
      "emp-alan",
      "emp-barbara",
      "emp-donald",
      "emp-katherine",
    ])
    expect(filterEmployees(database.employees, database.fields, "2020-01-15")).toHaveLength(0)
  })

  it("matches text inside records entries", () => {
    const found = filterEmployees(database.employees, database.fields, "yale")
    expect(found.map((employee) => employee.id)).toEqual(["emp-grace"])
  })
})
