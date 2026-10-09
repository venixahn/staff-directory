import { Body, Controller, Header, HttpCode, Inject, Param, Post, Query, StreamableFile } from "@nestjs/common"
import { profilePdfRequestSchema, reportPdfRequestSchema } from "@staff/shared"
import { parseBody, runEffect } from "../http"
import { profilePdf, reportPdf } from "./pdf"
import { PdfService } from "./pdf.service"

@Controller("pdf")
export class PdfController {
  constructor(@Inject(PdfService) private readonly pdf: PdfService) {}

  @Post("profile/:id")
  @HttpCode(200)
  @Header("Content-Type", "application/pdf")
  async profile(@Param("id") id: string, @Body() body: unknown) {
    const parsed = parseBody(profilePdfRequestSchema, body ?? {})
    const bytes = await runEffect(profilePdf(this.pdf.database, id, parsed.layout))
    return pdfFile(bytes, `profile-${id}.pdf`)
  }

  @Post("report")
  @HttpCode(200)
  @Header("Content-Type", "application/pdf")
  async report(@Query("q") query: string | undefined, @Body() body: unknown) {
    const parsed = parseBody(reportPdfRequestSchema, body ?? {})
    const bytes = await runEffect(reportPdf(this.pdf.database, query ?? "", parsed.layout))
    return pdfFile(bytes, "employee-directory.pdf")
  }
}

function pdfFile(bytes: Buffer, filename: string) {
  return new StreamableFile(bytes, {
    type: "application/pdf",
    disposition: `attachment; filename="${filename}"`,
  })
}
