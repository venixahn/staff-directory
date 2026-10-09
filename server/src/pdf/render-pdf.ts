import {
  pdfSpacing,
  type PdfPlan,
  type PlannedBlock,
  type PlannedField,
  type PlannedSection,
  type PlannedTable,
} from "@staff/shared"
import { createRequire } from "node:module"
import type { Readable } from "node:stream"

const require = createRequire(import.meta.url)

type FontMap = Record<string, { normal: string; bold: string; italics: string; bolditalics: string }>

const PdfPrinter = require("pdfmake") as new (fonts: FontMap) => {
  createPdfKitDocument(doc: unknown): Readable & { end: () => void }
}

const fonts: FontMap = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
}

export function renderPdf(plan: PdfPlan): Promise<Buffer> {
  const pdf = new PdfPrinter(fonts).createPdfKitDocument(toDocDefinition(plan))
  return collectPdf(pdf)
}

export function toDocDefinition(plan: PdfPlan) {
  return {
    pageSize: plan.pageSize,
    pageOrientation: plan.orientation,
    pageMargins: [plan.margins, plan.margins, plan.margins, plan.margins],
    defaultStyle: { font: "Helvetica", fontSize: plan.bodySize },
    content: [
      { text: plan.title, fontSize: plan.titleSize, bold: true, margin: [0, 0, 0, pdfSpacing.titleGap] },
      ...plan.blocks.map(blockContent),
    ],
  }
}

function blockContent(block: PlannedBlock): unknown {
  if (block.kind === "field") return fieldContent(block)
  if (block.kind === "columns") return { columns: block.columns.map((column) => column.map(fieldContent)), columnGap: pdfSpacing.columnGap }
  if (block.kind === "section") return sectionContent(block)
  return tableContent(block)
}

function sectionContent(section: PlannedSection) {
  const header = section.columns.map((column) => ({ text: column.label, bold: true }))
  const body = section.rows.length > 0 ? gridTable([header, ...section.rows], pdfSpacing.sectionCellPadding) : { text: "—" }
  return {
    stack: [{ text: section.label, bold: true, margin: [0, 0, 0, pdfSpacing.sectionLabelGap] }, body],
    margin: [0, pdfSpacing.sectionGap, 0, 0],
  }
}

function gridTable(body: unknown[][], padding: number) {
  return {
    table: { headerRows: 1, widths: body[0]?.map(() => "*") ?? [], body },
    layout: {
      paddingTop: () => padding,
      paddingBottom: () => padding,
      paddingLeft: () => pdfSpacing.cellPaddingX,
      paddingRight: () => pdfSpacing.cellPaddingX,
    },
  }
}

function fieldContent(field: PlannedField) {
  if (field.labelStyle === "stacked") {
    return { stack: [{ text: field.label, bold: true }, { text: field.value }], margin: fieldMargin(pdfSpacing.stackedFieldGap) }
  }
  return { text: [{ text: `${field.label}: `, bold: true }, field.value], margin: fieldMargin(pdfSpacing.inlineFieldGap) }
}

function fieldMargin(gap: number) {
  return [0, gap, 0, gap]
}

function tableContent(table: PlannedTable) {
  const span = table.columns.length
  if (span === 0) return { text: "No columns selected", italics: true }
  const header = table.columns.map((column) => ({ text: column.label, bold: true }))
  const rows = table.rows.map((row) => (row.kind === "group" ? groupCells(row.label, span) : row.cells))
  return gridTable([header, ...rows], table.padding)
}

function groupCells(label: string, span: number) {
  const filler = Array.from({ length: Math.max(span - 1, 0) }, () => "")
  return [{ text: label, colSpan: span, bold: true, fillColor: "#eeeeee" }, ...filler]
}

function collectPdf(pdf: Readable & { end: () => void }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    pdf.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)))
    pdf.on("end", () => resolve(Buffer.concat(chunks)))
    pdf.on("error", reject)
    pdf.end()
  })
}
