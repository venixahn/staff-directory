import { filterEmployees } from "@staff/shared"
import { Effect } from "effect"
import type { DatabaseService } from "../database/database.service"
import { DatabaseFailure, employeeNotFound } from "../errors"
import { planProfile, planReport } from "./plan-document"
import { renderPdf } from "./render-pdf"

export function profilePdf(database: DatabaseService, id: string) {
  return Effect.gen(function* () {
    const data = yield* database.read()
    const employee = data.employees.find((item) => item.id === id)
    if (!employee) return yield* Effect.fail(employeeNotFound(id))
    return yield* renderPlanned(planProfile(employee, data.fields, data.layouts.profile))
  })
}

export function reportPdf(database: DatabaseService, query: string) {
  return Effect.gen(function* () {
    const data = yield* database.read()
    const employees = filterEmployees(data.employees, data.fields, query)
    return yield* renderPlanned(planReport(employees, data.fields, data.layouts.report))
  })
}

function renderPlanned(doc: Parameters<typeof renderPdf>[0]) {
  return Effect.tryPromise({
    try: () => renderPdf(doc),
    catch: () => new DatabaseFailure({ message: "Could not render the PDF" }),
  })
}
