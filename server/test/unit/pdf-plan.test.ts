import { createSeedDatabase } from "@staff/shared"
import { describe, expect, it } from "vitest"
import { planProfile, planReport } from "../../src/pdf/plan-document"

describe("PDF plans", () => {
  const database = createSeedDatabase()
  const ada = database.employees[0]

  it("omits empty profile fields unless the layout asks for them", () => {
    const hidden = planProfile(ada, database.fields, database.layouts.profile)
    const text = JSON.stringify(hidden.content)
    expect(text).toContain("Ada")
    expect(text).not.toContain("Phone")
    const shown = planProfile(ada, database.fields, { ...database.layouts.profile, showEmptyFields: true })
    expect(JSON.stringify(shown.content)).toContain("Phone")
  })

  it("sorts a report and inserts a group heading when the department changes", () => {
    const doc = planReport(database.employees, database.fields, {
      ...database.layouts.report,
      columnIds: ["lastName", "department"],
      sortFieldId: "lastName",
      sortDirection: "asc",
      groupByFieldId: "department",
    })
    const table = doc.content[1] as { table: { body: unknown[][] } }
    const labels = table.table.body
      .map((row) => firstCell(row[0]))
      .filter((label) => label === "Engineering" || label === "Product" || label === "Research")
    expect(labels).toEqual(["Engineering", "Product", "Research"])
  })
})

function firstCell(cell: unknown): string {
  if (typeof cell === "string") return cell
  if (cell && typeof cell === "object" && "text" in cell) return String(cell.text)
  return ""
}
