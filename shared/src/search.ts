import type { Employee, Field } from "./schemas"

const textTypes = new Set(["text", "textarea", "email", "phone", "select"])

export function employeeMatches(employee: Employee, fields: Field[], query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (needle.length === 0) return true
  return fields.some((field) => valueIncludes(employee, field, needle))
}

export function filterEmployees(employees: Employee[], fields: Field[], query: string): Employee[] {
  return employees.filter((employee) => employeeMatches(employee, fields, query))
}

function valueIncludes(employee: Employee, field: Field, needle: string): boolean {
  if (!textTypes.has(field.type)) return false
  const value = employee.values[field.id] ?? ""
  return value.toLowerCase().includes(needle)
}
