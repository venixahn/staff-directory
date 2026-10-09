import type { Employee, Field, ProfileLayout, ReportLayout } from "@staff/shared"

export interface PlannedPdf {
  pageSize: "A4"
  pageOrientation: "portrait" | "landscape"
  defaultStyle: { font: "Helvetica" }
  styles: { title: { fontSize: number; bold: boolean; margin: [number, number, number, number] } }
  content: unknown[]
}

const titleStyle = {
  fontSize: 18,
  bold: true,
  margin: [0, 0, 0, 12] as [number, number, number, number],
}

export function planProfile(employee: Employee, fields: Field[], layout: ProfileLayout): PlannedPdf {
  return {
    pageSize: "A4",
    pageOrientation: layout.orientation,
    defaultStyle: { font: "Helvetica" },
    styles: { title: titleStyle },
    content: [{ text: layout.title, style: "title" }, ...profileLines(employee, fields, layout)],
  }
}

export function planReport(employees: Employee[], fields: Field[], layout: ReportLayout): PlannedPdf {
  const columns = columnsFor(fields, layout.columnIds)
  return {
    pageSize: "A4",
    pageOrientation: layout.orientation,
    defaultStyle: { font: "Helvetica" },
    styles: { title: { ...titleStyle, fontSize: 16 } },
    content: [
      { text: layout.title, style: "title" },
      {
        table: {
          headerRows: 1,
          widths: columns.map(() => "*"),
          body: [headerRow(columns), ...bodyRows(sortEmployees(employees, layout), columns, layout.groupByFieldId)],
        },
      },
    ],
  }
}

function profileLines(employee: Employee, fields: Field[], layout: ProfileLayout) {
  return layout.fieldIds
    .map((id) => profileLine(employee, fields, layout, id))
    .filter((line) => line !== null)
}

function profileLine(employee: Employee, fields: Field[], layout: ProfileLayout, id: string) {
  const field = fields.find((item) => item.id === id)
  if (!field) return null
  const value = employee.values[id] ?? ""
  if (!layout.showEmptyFields && value.trim() === "") return null
  return { text: `${field.label}: ${shown(value)}`, margin: [0, 2, 0, 2] }
}

function shown(value: string) {
  return value.trim().length > 0 ? value : "—"
}

function columnsFor(fields: Field[], ids: string[]): Field[] {
  return ids.flatMap((id) => {
    const field = fields.find((item) => item.id === id)
    return field ? [field] : []
  })
}

function headerRow(columns: Field[]) {
  return columns.map((field) => ({ text: field.label, bold: true }))
}

function sortEmployees(employees: Employee[], layout: ReportLayout): Employee[] {
  return [...employees].sort((left, right) => compareEmployees(left, right, layout))
}

function compareEmployees(left: Employee, right: Employee, layout: ReportLayout): number {
  const grouped = compareText(left, right, layout.groupByFieldId)
  if (grouped !== 0) return grouped
  const sorted = compareText(left, right, layout.sortFieldId)
  return layout.sortDirection === "asc" ? sorted : -sorted
}

function compareText(left: Employee, right: Employee, fieldId: string | null): number {
  if (!fieldId) return 0
  const leftValue = left.values[fieldId] ?? ""
  const rightValue = right.values[fieldId] ?? ""
  return leftValue.localeCompare(rightValue)
}

function bodyRows(employees: Employee[], columns: Field[], groupBy: string | null) {
  const rows: unknown[] = []
  let previous = "\u0000"
  for (const employee of employees) {
    previous = pushGroup(rows, employee, columns.length, groupBy, previous)
    rows.push(columns.map((field) => employee.values[field.id] ?? ""))
  }
  return rows
}

function pushGroup(
  rows: unknown[],
  employee: Employee,
  span: number,
  groupBy: string | null,
  previous: string,
) {
  if (!groupBy) return previous
  const label = employee.values[groupBy] ?? ""
  if (label === previous) return previous
  rows.push(groupCells(label || "—", span))
  return label
}

function groupCells(label: string, span: number) {
  const filler = Array.from({ length: Math.max(span - 1, 0) }, () => "")
  return [{ text: label, colSpan: span, bold: true }, ...filler]
}
