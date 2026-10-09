import type { Field } from "./schemas"

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function employeeValueMessage(fields: Field[], values: Record<string, string>): string | null {
  return firstProblem([
    unknownFieldMessage(fields, values),
    requiredMessage(fields, values),
    emailMessage(fields, values),
    selectMessage(fields, values),
  ])
}

function firstProblem(messages: Array<string | null>): string | null {
  return messages.find((message) => message !== null) ?? null
}

function unknownFieldMessage(fields: Field[], values: Record<string, string>): string | null {
  const ids = new Set(fields.map((field) => field.id))
  const unknown = Object.keys(values).find((id) => !ids.has(id))
  return unknown ? `Unknown field ${unknown}` : null
}

function requiredMessage(fields: Field[], values: Record<string, string>): string | null {
  const missing = fields.find((field) => field.required && blank(values[field.id]))
  return missing ? `${missing.label} is required` : null
}

function emailMessage(fields: Field[], values: Record<string, string>): string | null {
  const invalid = fields.find((field) => invalidEmail(field, values[field.id]))
  return invalid ? `${invalid.label} must be an email` : null
}

function selectMessage(fields: Field[], values: Record<string, string>): string | null {
  const invalid = fields.find((field) => invalidOption(field, values[field.id]))
  return invalid ? `${invalid.label} must be one of the options` : null
}

function invalidEmail(field: Field, value: string | undefined): boolean {
  if (field.type !== "email") return false
  if (!value || blank(value)) return false
  return !emailPattern.test(value)
}

function invalidOption(field: Field, value: string | undefined): boolean {
  if (field.type !== "select") return false
  if (!value || blank(value)) return false
  return !field.options?.includes(value)
}

function blank(value: string | undefined): boolean {
  return (value ?? "").trim().length === 0
}
