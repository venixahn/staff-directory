import type { Employee, EmployeeValues, Field, FieldDraft, ProfileLayout, ReportLayout } from "@staff/shared"

export function listEmployees(query: string) {
  const params = new URLSearchParams()
  if (query.trim()) params.set("q", query.trim())
  const suffix = params.size ? `?${params}` : ""
  return readJson<Employee[]>(fetch(`/api/employees${suffix}`))
}

export function getEmployee(id: string) {
  return readJson<Employee>(fetch(`/api/employees/${id}`))
}

export function createEmployee(values: EmployeeValues) {
  return sendJson<Employee>("/api/employees", "POST", { values })
}

export function updateEmployee(id: string, values: EmployeeValues) {
  return sendJson<Employee>(`/api/employees/${id}`, "PATCH", { values })
}

export function removeEmployee(id: string) {
  return sendEmpty(`/api/employees/${id}`, "DELETE")
}

export function listFields() {
  return readJson<Field[]>(fetch("/api/fields"))
}

export function createField(draft: FieldDraft) {
  return sendJson<Field>("/api/fields", "POST", draft)
}

export function updateField(id: string, draft: FieldDraft) {
  return sendJson<Field>(`/api/fields/${id}`, "PATCH", draft)
}

export function removeField(id: string) {
  return sendEmpty(`/api/fields/${id}`, "DELETE")
}

export function reorderFields(ids: string[]) {
  return sendJson<Field[]>("/api/fields/order", "PUT", { ids })
}

export function getProfileLayout() {
  return readJson<ProfileLayout>(fetch("/api/layouts/profile"))
}

export function saveProfileLayout(layout: ProfileLayout) {
  return sendJson<ProfileLayout>("/api/layouts/profile", "PUT", layout)
}

export function getReportLayout() {
  return readJson<ReportLayout>(fetch("/api/layouts/report"))
}

export function saveReportLayout(layout: ReportLayout) {
  return sendJson<ReportLayout>("/api/layouts/report", "PUT", layout)
}

export async function downloadPdf(path: string, filename: string, body?: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) throw new Error(await failureMessage(response))
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

async function readJson<T>(request: Promise<Response>): Promise<T> {
  const response = await request
  if (!response.ok) throw new Error(await failureMessage(response))
  return response.json() as Promise<T>
}

function sendJson<T>(path: string, method: string, body: unknown) {
  return readJson<T>(
    fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  )
}

async function sendEmpty(path: string, method: string) {
  const response = await fetch(path, { method })
  if (!response.ok) throw new Error(await failureMessage(response))
}

async function failureMessage(response: Response) {
  const body = await response.json().catch(() => ({ message: response.statusText }))
  return textMessage(body, response.statusText)
}

function textMessage(body: { message?: unknown }, fallback: string) {
  if (typeof body.message === "string") return body.message
  if (Array.isArray(body.message) && typeof body.message[0] === "string") return body.message[0]
  return fallback
}
