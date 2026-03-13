import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { DashboardTrendPointModel } from "./dashboard-trend-point.model";
import { WarehouseInsightModel } from "./warehouse-insight.model";

@ObjectType()
export class DashboardStatsModel {
  @Field(() => Int)
  totalStock!: number;

  @Field(() => Float)
  marketValue!: number;

  @Field(() => Int)
  lowInventory!: number;

  @Field(() => Int)
  warehouseCount!: number;

  @Field(() => Int)
  pendingPurchaseOrders!: number;

  @Field(() => Int)
  alertsTriggered!: number;

  @Field(() => [WarehouseInsightModel])
  warehouseInsights!: WarehouseInsightModel[];

  @Field(() => [DashboardTrendPointModel])
  receiptsTrend!: DashboardTrendPointModel[];
}

