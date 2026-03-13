import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class WarehouseInsightModel {
  @Field()
  warehouseId!: string;

  @Field()
  warehouseName!: string;

  @Field(() => Int)
  totalUnits!: number;

  @Field(() => Int)
  lowStockSkus!: number;
}

