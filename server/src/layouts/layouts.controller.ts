import { Body, Controller, Get, Inject, Put } from "@nestjs/common"
import { profileLayoutSchema, reportLayoutSchema } from "@staff/shared"
import { parseBody, runEffect } from "../http"
import { getProfileLayout, getReportLayout, putProfileLayout, putReportLayout } from "./layouts"
import { LayoutsService } from "./layouts.service"

@Controller("layouts")
export class LayoutsController {
  constructor(@Inject(LayoutsService) private readonly layouts: LayoutsService) {}

  @Get("profile")
  profile() {
    return runEffect(getProfileLayout(this.layouts.database))
  }

  @Put("profile")
  saveProfile(@Body() body: unknown) {
    const parsed = parseBody(profileLayoutSchema, body)
    return runEffect(putProfileLayout(this.layouts.database, parsed))
  }

  @Get("report")
  report() {
    return runEffect(getReportLayout(this.layouts.database))
  }

  @Put("report")
  saveReport(@Body() body: unknown) {
    const parsed = parseBody(reportLayoutSchema, body)
    return runEffect(putReportLayout(this.layouts.database, parsed))
  }
}
