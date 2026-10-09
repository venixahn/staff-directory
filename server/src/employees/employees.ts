import { employeeValueMessage, filterEmployees, type Employee, type StaffDatabase } from "@staff/shared"
import { Effect } from "effect"
import { employeeNotFound, invalidField, type EmployeeNotFound, type InvalidField } from "../errors"
import type { Change, DatabaseService } from "../database/database.service"

export function listEmployees(database: DatabaseService, query: string) {
  return database.read().pipe(Effect.map((data) => filterEmployees(data.employees, data.fields, query)))
}

export function getEmployee(database: DatabaseService, id: string) {
  return database.read().pipe(Effect.flatMap((data) => findEmployee(data, id)))
}

export function createEmployee(database: DatabaseService, values: Record<string, string>) {
  return database.transaction((data) => insertEmployee(data, values))
}

export function updateEmployee(database: DatabaseService, id: string, values: Record<string, string>) {
  return database.transaction((data) => replaceEmployee(data, id, values))
}

export function deleteEmployee(database: DatabaseService, id: string) {
  return database.transaction((data) => removeEmployee(data, id))
}

function findEmployee(data: StaffDatabase, id: string): Effect.Effect<Employee, EmployeeNotFound> {
  const employee = data.employees.find((item) => item.id === id)
  if (!employee) return Effect.fail(employeeNotFound(id))
  return Effect.succeed(employee)
}

function insertEmployee(data: StaffDatabase, values: Record<string, string>): Effect.Effect<Change<Employee>, InvalidField> {
  const message = employeeValueMessage(data.fields, values)
  if (message) return Effect.fail(invalidField(message))
  const employee: Employee = { id: crypto.randomUUID(), values }
  return Effect.succeed({
    data: { ...data, employees: [...data.employees, employee] },
    value: employee,
  })
}

function replaceEmployee(
  data: StaffDatabase,
  id: string,
  patch: Record<string, string>,
): Effect.Effect<Change<Employee>, EmployeeNotFound | InvalidField> {
  const current = data.employees.find((item) => item.id === id)
  if (!current) return Effect.fail(employeeNotFound(id))
  const values = { ...current.values, ...patch }
  const message = employeeValueMessage(data.fields, values)
  if (message) return Effect.fail(invalidField(message))
  const employee = { ...current, values }
  return Effect.succeed({
    data: { ...data, employees: data.employees.map((item) => (item.id === id ? employee : item)) },
    value: employee,
  })
}

function removeEmployee(data: StaffDatabase, id: string): Effect.Effect<Change<undefined>, EmployeeNotFound> {
  if (!data.employees.some((item) => item.id === id)) return Effect.fail(employeeNotFound(id))
  return Effect.succeed({
    data: { ...data, employees: data.employees.filter((item) => item.id !== id) },
    value: undefined,
  })
}
