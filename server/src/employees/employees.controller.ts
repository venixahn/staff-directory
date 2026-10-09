import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from "@nestjs/common"
import { employeeBodySchema } from "@staff/shared"
import { parseBody, runEffect } from "../http"
import { createEmployee, deleteEmployee, getEmployee, listEmployees, updateEmployee } from "./employees"
import { EmployeesService } from "./employees.service"

@Controller("employees")
export class EmployeesController {
  constructor(@Inject(EmployeesService) private readonly employees: EmployeesService) {}

  @Get()
  list(@Query("q") query?: string) {
    return runEffect(listEmployees(this.employees.database, query ?? ""))
  }

  @Post()
  create(@Body() body: unknown) {
    const parsed = parseBody(employeeBodySchema, body)
    return runEffect(createEmployee(this.employees.database, parsed.values))
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return runEffect(getEmployee(this.employees.database, id))
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: unknown) {
    const parsed = parseBody(employeeBodySchema, body)
    return runEffect(updateEmployee(this.employees.database, id, parsed.values))
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return runEffect(deleteEmployee(this.employees.database, id))
  }
}
