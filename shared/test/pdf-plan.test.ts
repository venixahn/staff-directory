import { describe, expect, it } from "vitest"
import { pageDimensions, planProfile, planReport, type PlannedTable } from "../src/pdf-plan"
import { createSeedDatabase } from "../src/seed"

describe("PDF plans", () => {
  const database = createSeedDatabase()
  const ada = database.employees[0]!
  const profile = database.layouts.profile
  const report = database.layouts.report

  it("omits empty profile fields unless the layout asks for them", () => {
    const hidden = planProfile(ada, database.fields, profile)
    expect(labels(hidden.blocks)).toContain("First name")
    expect(labels(hidden.blocks)).not.toContain("Phone")
    const shown = planProfile(ada, database.fields, { ...profile, showEmptyFields: true })
    expect(labels(shown.blocks)).toContain("Phone")
  })

  it("splits profile fields into two columns and keeps their order", () => {
    const plan = planProfile(ada, database.fields, { ...profile, columns: 2, labelStyle: "stacked" })
    expect(plan.blocks).toHaveLength(1)
    const block = plan.blocks[0]
    if (block?.kind !== "columns") throw new Error("expected columns")
    expect(block.columns[0]?.[0]).toMatchObject({ fieldId: "firstName", labelStyle: "stacked" })
    expect(block.columns.flat().map((field) => field.fieldId)).toEqual(labels(planProfile(ada, database.fields, profile).blocks, "id"))
  })

  it("carries paper, margin, and type sizes into the plan", () => {
    const plan = planProfile(ada, database.fields, {
      ...profile,
      pageSize: "LETTER",
      orientation: "landscape",
      margin: "wide",
      titleSize: 24,
      bodySize: 12,
    })
    expect(plan).toMatchObject({ pageSize: "LETTER", margins: 64, titleSize: 24, bodySize: 12 })
    expect(pageDimensions(plan)).toEqual({ width: 792, height: 612 })
  })

  it("sorts a report and inserts a group row when the department changes", () => {
    const plan = planReport(database.employees, database.fields, {
      ...report,
      columnIds: ["lastName", "department"],
      sortFieldId: "lastName",
      sortDirection: "asc",
      groupByFieldId: "department",
      density: "compact",
    })
    const table = plan.blocks[0] as PlannedTable
    expect(table.padding).toBe(2)
    const groups = table.rows.flatMap((row) => (row.kind === "group" ? [row.label] : []))
    expect(groups).toEqual(["Engineering", "Product", "Research"])
  })
})

function labels(blocks: ReturnType<typeof planProfile>["blocks"], key: "label" | "id" = "label"): string[] {
  return blocks.flatMap((block) => {
    if (block.kind === "field") return [key === "id" ? block.fieldId : block.label]
    return []
  })
}
