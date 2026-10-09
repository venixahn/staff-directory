import { Module, type DynamicModule } from "@nestjs/common"
import { DatabaseService } from "./database.service"
import { DB_PATH } from "./db-path"

@Module({})
export class DatabaseModule {
  static register(dbPath: string): DynamicModule {
    return {
      module: DatabaseModule,
      global: true,
      providers: [{ provide: DB_PATH, useValue: dbPath }, DatabaseService],
      exports: [DatabaseService],
    }
  }
}
