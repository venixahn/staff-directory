import { textValue, type Employee } from "@staff/shared"

export function displayName(employee: Employee) {
  return `${textValue(employee.values, "firstName")} ${textValue(employee.values, "lastName")}`.trim()
}

export function messageOf(cause: unknown) {
  return cause instanceof Error ? cause.message : "Something went wrong"
}
