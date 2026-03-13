import { Module } from "@nestjs/common";
import { DashboardResolver } from "./dashboard.resolver";
import { DashboardService } from "./dashboard.service";
import { ProductsModule } from "../products/products.module";

@Module({
  imports: [ProductsModule],
  providers: [DashboardResolver, DashboardService]
})
export class DashboardModule {}