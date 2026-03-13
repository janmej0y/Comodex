import { Module } from "@nestjs/common";
import { ProcurementResolver } from "./procurement.resolver";
import { ProcurementService } from "./procurement.service";

@Module({
  providers: [ProcurementResolver, ProcurementService],
  exports: [ProcurementService]
})
export class ProcurementModule {}

