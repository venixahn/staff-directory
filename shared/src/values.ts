import { filledEntries, isRecords, recordEntries, textValue } from "./field-values"
import type { EmployeeValues, Field } from "./schemas"

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function employeeValueMessage(fields: Field[], values: EmployeeValues): string | null {
  return firstProblem([
    unknownFieldMessage(fields, values),
    shapeMessage(fields, values),
    columnMessage(fields, values),
    requiredMessage(fields, values),
    emailMessage(fields, values),
    selectMessage(fields, values),
  ])
}

function firstProblem(messages: Array<string | null>): string | null {
  return messages.find((message) => message !== null) ?? null
}

function unknownFieldMessage(fields: Field[], values: EmployeeValues): string | null {
  const ids = new Set(fields.map((field) => field.id))
  const unknown = Object.keys(values).find((id) => !ids.has(id))
  return unknown ? `Unknown field ${unknown}` : null
}

function shapeMessage(fields: Field[], values: EmployeeValues): string | null {
  const wrong = fields.find((field) => field.id in values && Array.isArray(values[field.id]) !== isRecords(field))
  if (!wrong) return null
  return isRecords(wrong) ? `${wrong.label} must be a list of entries` : `${wrong.label} must be text`
}

function columnMessage(fields: Field[], values: EmployeeValues): string | null {
  for (const field of fields.filter(isRecords)) {
    const known = new Set((field.columns ?? []).map((column) => column.id))
    const stray = recordEntries(values, field.id).flatMap(Object.keys).find((id) => !known.has(id))
    if (stray) return `${field.label} has no column ${stray}`
  }
  return null
}

function requiredMessage(fields: Field[], values: EmployeeValues): string | null {
  const missing = fields.find((field) => field.required && empty(field, values))
  return missing ? `${missing.label} is required` : null
}

function emailMessage(fields: Field[], values: EmployeeValues): string | null {
  const invalid = fields.find((field) => invalidEmail(field, textValue(values, field.id)))
  return invalid ? `${invalid.label} must be an email` : null
}

function selectMessage(fields: Field[], values: EmployeeValues): string | null {
  const invalid = fields.find((field) => invalidOption(field, textValue(values, field.id)))
  return invalid ? `${invalid.label} must be one of the options` : null
}

function empty(field: Field, values: EmployeeValues): boolean {
  if (isRecords(field)) return filledEntries(recordEntries(values, field.id)).length === 0
  return blank(textValue(values, field.id))
}

function invalidEmail(field: Field, value: string): boolean {
  if (field.type !== "email" || blank(value)) return false
  return !emailPattern.test(value)
}

function invalidOption(field: Field, value: string): boolean {
  if (field.type !== "select" || blank(value)) return false
  return !field.options?.includes(value)
}

function blank(value: string): boolean {
  return value.trim().length === 0
}
