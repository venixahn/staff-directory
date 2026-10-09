import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put } from "@nestjs/common"
import { fieldDraftSchema, fieldOrderSchema } from "@staff/shared"
import { parseBody, runEffect } from "../http"
import { createField, deleteField, listFields, reorderFields, updateField } from "./fields"
import { FieldsService } from "./fields.service"

@Controller("fields")
export class FieldsController {
  constructor(@Inject(FieldsService) private readonly fields: FieldsService) {}

  @Get()
  list() {
    return runEffect(listFields(this.fields.database))
  }

  @Put("order")
  order(@Body() body: unknown) {
    const parsed = parseBody(fieldOrderSchema, body)
    return runEffect(reorderFields(this.fields.database, parsed.ids))
  }

  @Post()
  create(@Body() body: unknown) {
    const parsed = parseBody(fieldDraftSchema, body)
    return runEffect(createField(this.fields.database, parsed))
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: unknown) {
    const parsed = parseBody(fieldDraftSchema, body)
    return runEffect(updateField(this.fields.database, id, parsed))
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return runEffect(deleteField(this.fields.database, id))
  }
}
