import { createRequire } from "node:module"
import type { Readable } from "node:stream"
import type { PlannedPdf } from "./plan-document"

const require = createRequire(import.meta.url)

type FontMap = Record<string, { normal: string; bold: string; italics: string; bolditalics: string }>

const PdfPrinter = require("pdfmake") as new (fonts: FontMap) => {
  createPdfKitDocument(doc: PlannedPdf): Readable & { end: () => void }
}

const fonts: FontMap = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
}

export function renderPdf(doc: PlannedPdf): Promise<Buffer> {
  const pdf = new PdfPrinter(fonts).createPdfKitDocument(doc)
  return collectPdf(pdf)
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
