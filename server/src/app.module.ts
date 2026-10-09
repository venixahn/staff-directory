import { Module, type DynamicModule } from "@nestjs/common"
import { DatabaseModule } from "./database/database.module"
import { EmployeesModule } from "./employees/employees.module"
import { FieldsModule } from "./fields/fields.module"
import { LayoutsModule } from "./layouts/layouts.module"
import { PdfModule } from "./pdf/pdf.module"

@Module({})
export class AppModule {
  static register(dbPath: string): DynamicModule {
    return {
      module: AppModule,
      imports: [DatabaseModule.register(dbPath), EmployeesModule, FieldsModule, LayoutsModule, PdfModule],
    }
  }
}
