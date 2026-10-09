import { Module, type DynamicModule } from "@nestjs/common"
import { DatabaseModule } from "./database/database.module"
import { EmployeesModule } from "./employees/employees.module"

@Module({})
export class AppModule {
  static register(dbPath: string): DynamicModule {
    return {
      module: AppModule,
      imports: [DatabaseModule.register(dbPath), EmployeesModule],
    }
  }
}
