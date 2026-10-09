import { isRecords, type Field, type ProfileLayout, type ReportLayout, type StaffDatabase } from "@staff/shared"
import { Effect } from "effect"
import type { DatabaseService } from "../database/database.service"
import { invalidField } from "../errors"

export function getProfileLayout(database: DatabaseService) {
  return database.read().pipe(Effect.map((data) => data.layouts.profile))
}

export function getReportLayout(database: DatabaseService) {
  return database.read().pipe(Effect.map((data) => data.layouts.report))
}

export function putProfileLayout(database: DatabaseService, layout: ProfileLayout) {
  return database.transaction((data) => saveProfile(data, layout))
}

export function putReportLayout(database: DatabaseService, layout: ReportLayout) {
  return database.transaction((data) => saveReport(data, layout))
}

export function profileLayoutMessage(fields: Field[], layout: ProfileLayout): string | null {
  return idListMessage(fields, layout.fieldIds)
}

function saveProfile(data: StaffDatabase, layout: ProfileLayout) {
  const message = profileLayoutMessage(data.fields, layout)
  if (message) return Effect.fail(invalidField(message))
  return Effect.succeed({
    data: { ...data, layouts: { ...data.layouts, profile: layout } },
    value: layout,
  })
}

function saveReport(data: StaffDatabase, layout: ReportLayout) {
  const message = reportMessage(data.fields, layout)
  if (message) return Effect.fail(invalidField(message))
  return Effect.succeed({
    data: { ...data, layouts: { ...data.layouts, report: layout } },
    value: layout,
  })
}

export function reportMessage(fields: Field[], layout: ReportLayout): string | null {
  const messages = [
    idListMessage(fields, layout.columnIds),
    unknownId(fields, [layout.sortFieldId]),
    groupMessage(fields, layout.groupByFieldId),
    recordsMessage(fields, [...layout.columnIds, layout.sortFieldId, layout.groupByFieldId ?? ""]),
  ]
  return messages.find((message) => message !== null) ?? null
}

function recordsMessage(fields: Field[], ids: string[]): string | null {
  const records = fields.find((field) => isRecords(field) && ids.includes(field.id))
  return records ? `${records.label} is a list and cannot be a report column, sort, or group` : null
}

function idListMessage(fields: Field[], ids: string[]): string | null {
  if (new Set(ids).size !== ids.length) return "Field list contains a duplicate"
  return unknownId(fields, ids)
}

function unknownId(fields: Field[], ids: string[]): string | null {
  const known = new Set(fields.map((field) => field.id))
  const missing = ids.find((id) => !known.has(id))
  return missing ? `Unknown field ${missing}` : null
}

function groupMessage(fields: Field[], id: string | null): string | null {
  if (!id) return null
  return unknownId(fields, [id])
}
