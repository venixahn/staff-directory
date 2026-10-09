import { recordEntries, textValue } from "./field-values"
import type { Employee, Field } from "./schemas"

const textTypes = new Set(["text", "textarea", "email", "phone", "select"])

export function employeeMatches(employee: Employee, fields: Field[], query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (needle.length === 0) return true
  return fields.some((field) => searchableText(employee, field).some((text) => text.toLowerCase().includes(needle)))
}

export function filterEmployees(employees: Employee[], fields: Field[], query: string): Employee[] {
  return employees.filter((employee) => employeeMatches(employee, fields, query))
}

function searchableText(employee: Employee, field: Field): string[] {
  if (field.type === "records") return recordEntries(employee.values, field.id).flatMap(Object.values)
  if (!textTypes.has(field.type)) return []
  return [textValue(employee.values, field.id)]
}
