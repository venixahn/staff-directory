import { filledEntries, isRecords, recordEntries, textValue } from "./field-values"
import type { Density, Employee, Field, LabelStyle, Margin, PageSize, ProfileLayout, ReportLayout } from "./schemas"

export interface PlannedField {
  kind: "field"
  fieldId: string
  label: string
  value: string
  labelStyle: LabelStyle
}

export interface PlannedColumns {
  kind: "columns"
  columns: PlannedField[][]
}

export interface PlannedTable {
  kind: "table"
  columns: Array<{ fieldId: string; label: string }>
  rows: PlannedRow[]
  padding: number
}

export type PlannedRow = { kind: "group"; label: string } | { kind: "cells"; cells: string[] }

export interface PlannedSection {
  kind: "section"
  fieldId: string
  label: string
  columns: Array<{ id: string; label: string }>
  rows: string[][]
}

export type PlannedBlock = PlannedField | PlannedColumns | PlannedTable | PlannedSection

export interface PdfPlan {
  pageSize: PageSize
  orientation: "portrait" | "landscape"
  margins: number
  titleSize: number
  bodySize: number
  title: string
  blocks: PlannedBlock[]
}

export const pdfSpacing = {
  /** pdfmake lays Helvetica lines out at (ascender 718 - descender -207) / 1000 of the font size. */
  lineHeight: 0.925,
  titleGap: 12,
  columnGap: 18,
  inlineFieldGap: 2,
  stackedFieldGap: 4,
  cellPaddingX: 4,
  sectionGap: 10,
  sectionLabelGap: 4,
  sectionCellPadding: 3,
} as const

const pagePoints: Record<PageSize, [number, number]> = {
  A4: [595.28, 841.89],
  LETTER: [612, 792],
}

export function pageDimensions(plan: Pick<PdfPlan, "pageSize" | "orientation">): { width: number; height: number } {
  const [short, long] = pagePoints[plan.pageSize]
  return plan.orientation === "portrait" ? { width: short, height: long } : { width: long, height: short }
}

export function marginPoints(margin: Margin): number {
  if (margin === "narrow") return 24
  if (margin === "wide") return 64
  return 40
}

export function planProfile(employee: Employee, fields: Field[], layout: ProfileLayout): PdfPlan {
  return {
    ...pageBox(layout),
    blocks: profileBlocks(employee, fields, layout),
  }
}

export function planReport(employees: Employee[], fields: Field[], layout: ReportLayout): PdfPlan {
  const columns = columnsFor(fields, layout.columnIds).filter((field) => !isRecords(field))
  const sorted = sortEmployees(employees, layout)
  return {
    ...pageBox(layout),
    blocks: [
      {
        kind: "table",
        columns: columns.map((field) => ({ fieldId: field.id, label: field.label })),
        rows: bodyRows(sorted, columns, layout.groupByFieldId),
        padding: densityPadding(layout.density),
      },
    ],
  }
}

function pageBox(layout: ProfileLayout | ReportLayout) {
  return {
    pageSize: layout.pageSize,
    orientation: layout.orientation,
    margins: marginPoints(layout.margin),
    titleSize: layout.titleSize,
    bodySize: layout.bodySize,
    title: layout.title,
  }
}

function splitColumns(lines: PlannedField[]): PlannedColumns {
  const half = Math.ceil(lines.length / 2)
  return { kind: "columns", columns: [lines.slice(0, half), lines.slice(half)] }
}

function profileBlocks(employee: Employee, fields: Field[], layout: ProfileLayout): PlannedBlock[] {
  const blocks: PlannedBlock[] = []
  let run: PlannedField[] = []
  const flush = () => {
    blocks.push(...arrangeRun(run, layout))
    run = []
  }
  for (const field of columnsFor(fields, layout.fieldIds)) {
    if (isRecords(field)) {
      flush()
      blocks.push(...profileSection(employee, field, layout))
    } else {
      run.push(...profileLine(employee, field, layout))
    }
  }
  flush()
  return blocks
}

function arrangeRun(run: PlannedField[], layout: ProfileLayout): PlannedBlock[] {
  if (run.length === 0) return []
  return layout.columns === 2 ? [splitColumns(run)] : run
}

function profileLine(employee: Employee, field: Field, layout: ProfileLayout): PlannedField[] {
  const value = textValue(employee.values, field.id)
  if (!layout.showEmptyFields && value.trim() === "") return []
  return [{ kind: "field", fieldId: field.id, label: field.label, value: shown(value), labelStyle: layout.labelStyle }]
}

function profileSection(employee: Employee, field: Field, layout: ProfileLayout): PlannedSection[] {
  const entries = filledEntries(recordEntries(employee.values, field.id))
  if (!layout.showEmptyFields && entries.length === 0) return []
  const columns = (field.columns ?? []).map((column) => ({ id: column.id, label: column.label }))
  const rows = entries.map((entry) => columns.map((column) => entry[column.id] ?? ""))
  return [{ kind: "section", fieldId: field.id, label: field.label, columns, rows }]
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

function densityPadding(density: Density) {
  return density === "compact" ? 2 : 6
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
  return textValue(left.values, fieldId).localeCompare(textValue(right.values, fieldId))
}

function bodyRows(employees: Employee[], columns: Field[], groupBy: string | null): PlannedRow[] {
  const rows: PlannedRow[] = []
  let previous: string | null = null
  for (const employee of employees) {
    const label = groupBy ? textValue(employee.values, groupBy) : null
    if (label !== null && label !== previous) rows.push({ kind: "group", label: label || "—" })
    previous = label
    rows.push({ kind: "cells", cells: columns.map((field) => textValue(employee.values, field.id)) })
  }
  return rows
}
