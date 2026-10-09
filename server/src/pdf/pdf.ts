import {
  filterEmployees,
  planProfile,
  planReport,
  type PdfPlan,
  type ProfileLayout,
  type ReportLayout,
} from "@staff/shared"
import { Effect } from "effect"
import type { DatabaseService } from "../database/database.service"
import { DatabaseFailure, employeeNotFound, invalidField } from "../errors"
import { profileLayoutMessage, reportMessage } from "../layouts/layouts"
import { renderPdf } from "./render-pdf"

export function profilePdf(database: DatabaseService, id: string, override?: ProfileLayout) {
  return Effect.gen(function* () {
    const data = yield* database.read()
    const employee = data.employees.find((item) => item.id === id)
    if (!employee) return yield* Effect.fail(employeeNotFound(id))
    const layout = override ?? data.layouts.profile
    const message = profileLayoutMessage(data.fields, layout)
    if (message) return yield* Effect.fail(invalidField(message))
    return yield* renderPlanned(planProfile(employee, data.fields, layout))
  })
}

export function reportPdf(database: DatabaseService, query: string, override?: ReportLayout) {
  return Effect.gen(function* () {
    const data = yield* database.read()
    const layout = override ?? data.layouts.report
    const message = reportMessage(data.fields, layout)
    if (message) return yield* Effect.fail(invalidField(message))
    const employees = filterEmployees(data.employees, data.fields, query)
    return yield* renderPlanned(planReport(employees, data.fields, layout))
  })
}

function renderPlanned(plan: PdfPlan) {
  return Effect.tryPromise({
    try: () => renderPdf(plan),
    catch: () => new DatabaseFailure({ message: "Could not render the PDF" }),
  })
}
