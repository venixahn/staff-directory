import { Inject, Injectable } from "@nestjs/common"
import { DatabaseService } from "../database/database.service"

@Injectable()
export class PdfService {
  constructor(@Inject(DatabaseService) readonly database: DatabaseService) {}
}
