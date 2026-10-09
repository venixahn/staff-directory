import type { Employee } from "@staff/shared"

export function displayName(employee: Employee) {
  return `${employee.values.firstName ?? ""} ${employee.values.lastName ?? ""}`.trim()
}

export function messageOf(cause: unknown) {
  return cause instanceof Error ? cause.message : "Something went wrong"
}
