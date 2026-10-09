import {
  uniqueSlug,
  type Field,
  type FieldDraft,
  type ReportLayout,
  type StaffDatabase,
} from "@staff/shared"
import { Effect } from "effect"
import type { Change, DatabaseService } from "../database/database.service"
import {
  builtinFieldProtected,
  fieldNotFound,
  invalidField,
  type BuiltinFieldProtected,
  type FieldNotFound,
  type InvalidField,
} from "../errors"

export function listFields(database: DatabaseService) {
  return database.read().pipe(Effect.map((data) => data.fields))
}

export function createField(database: DatabaseService, draft: FieldDraft) {
  return database.transaction((data) => Effect.succeed(appendField(data, draft)))
}

export function updateField(database: DatabaseService, id: string, draft: FieldDraft) {
  return database.transaction((data) => changeField(data, id, draft))
}

export function deleteField(database: DatabaseService, id: string) {
  return database.transaction((data) => dropField(data, id))
}

export function reorderFields(database: DatabaseService, ids: string[]) {
  return database.transaction((data) => orderFields(data, ids))
}

function appendField(data: StaffDatabase, draft: FieldDraft) {
  const field = fieldFromDraft(draft, takenIds(data))
  return {
    data: {
      ...data,
      fields: [...data.fields, field],
      layouts: {
        ...data.layouts,
        profile: {
          ...data.layouts.profile,
          fieldIds: [...data.layouts.profile.fieldIds, field.id],
        },
      },
    },
    value: field,
  }
}

function changeField(
  data: StaffDatabase,
  id: string,
  draft: FieldDraft,
): Effect.Effect<Change<Field>, FieldNotFound | InvalidField> {
  const current = data.fields.find((field) => field.id === id)
  if (!current) return Effect.fail(fieldNotFound(id))
  const merged = mergeField(current, draft)
  if (merged.message) return Effect.fail(invalidField(merged.message))
  return Effect.succeed({
    data: { ...data, fields: data.fields.map((field) => (field.id === id ? merged.field : field)) },
    value: merged.field,
  })
}

function dropField(data: StaffDatabase, id: string): Effect.Effect<Change<undefined>, FieldNotFound | BuiltinFieldProtected> {
  const current = data.fields.find((field) => field.id === id)
  if (!current) return Effect.fail(fieldNotFound(id))
  if (current.builtin) return Effect.fail(builtinFieldProtected(id))
  return Effect.succeed({ data: withoutField(data, id), value: undefined })
}

function orderFields(data: StaffDatabase, ids: string[]): Effect.Effect<Change<Field[]>, InvalidField> {
  if (!sameMembers(data.fields.map((field) => field.id), ids)) {
    return Effect.fail(invalidField("Field order must list each field once"))
  }
  const fields = ids.map((id) => fieldById(data.fields, id))
  return Effect.succeed({ data: { ...data, fields }, value: fields })
}

function fieldById(fields: Field[], id: string): Field {
  const field = fields.find((item) => item.id === id)
  if (!field) throw new Error(`Missing field ${id}`)
  return field
}

function fieldFromDraft(draft: FieldDraft, taken: Set<string>): Field {
  return {
    id: uniqueSlug(draft.label, taken),
    label: draft.label,
    type: draft.type,
    required: draft.required,
    builtin: false,
    options: draft.type === "select" ? draft.options : undefined,
  }
}

function mergeField(field: Field, draft: FieldDraft): { field: Field; message?: string } {
  if (field.builtin && draft.type !== field.type) {
    return { field, message: "Builtin field type cannot change" }
  }
  return {
    field: {
      ...field,
      label: draft.label,
      type: draft.type,
      required: draft.required,
      options: draft.type === "select" ? draft.options : undefined,
    },
  }
}

function withoutField(data: StaffDatabase, id: string): StaffDatabase {
  return {
    fields: data.fields.filter((field) => field.id !== id),
    employees: data.employees.map((employee) => stripValue(employee, id)),
    layouts: {
      profile: {
        ...data.layouts.profile,
        fieldIds: data.layouts.profile.fieldIds.filter((fieldId) => fieldId !== id),
      },
      report: cleanReport(data.layouts.report, id),
    },
  }
}

function stripValue(employee: StaffDatabase["employees"][number], id: string) {
  const values = { ...employee.values }
  delete values[id]
  return { ...employee, values }
}

function cleanReport(layout: ReportLayout, id: string): ReportLayout {
  return {
    ...layout,
    columnIds: layout.columnIds.filter((fieldId) => fieldId !== id),
    sortFieldId: layout.sortFieldId === id ? "lastName" : layout.sortFieldId,
    groupByFieldId: layout.groupByFieldId === id ? null : layout.groupByFieldId,
  }
}

function takenIds(data: StaffDatabase): Set<string> {
  return new Set(data.fields.map((field) => field.id))
}

function sameMembers(current: string[], next: string[]): boolean {
  if (current.length !== next.length) return false
  const seen = new Set(next)
  return seen.size === next.length && current.every((id) => seen.has(id))
}
