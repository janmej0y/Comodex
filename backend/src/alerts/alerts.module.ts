import { Module } from "@nestjs/common";
import { AlertsResolver } from "./alerts.resolver";
import { AlertsService } from "./alerts.service";

@Module({
  providers: [AlertsResolver, AlertsService],
  exports: [AlertsService]
})
export class AlertsModule {}

