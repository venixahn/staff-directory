import type { EmployeeValues, Field, FieldValue, RecordEntry } from "./schemas"

export function textValue(values: EmployeeValues, id: string): string {
  const value = values[id]
  return typeof value === "string" ? value : ""
}

export function recordEntries(values: EmployeeValues, id: string): RecordEntry[] {
  const value = values[id]
  return Array.isArray(value) ? value : []
}

export function filledEntries(entries: RecordEntry[]): RecordEntry[] {
  return entries.filter((entry) => Object.values(entry).some((cell) => cell.trim().length > 0))
}

export function isRecords(field: Pick<Field, "type">): boolean {
  return field.type === "records"
}

export function emptyValue(field: Field): FieldValue {
  if (isRecords(field)) return []
  if (field.type === "select") return field.options?.[0] ?? ""
  return ""
}
