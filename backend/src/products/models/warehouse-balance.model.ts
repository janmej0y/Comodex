import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class WarehouseBalanceModel {
  @Field()
  warehouseId!: string;

  @Field()
  warehouseCode!: string;

  @Field()
  warehouseName!: string;

  @Field(() => Int)
  quantity!: number;
}

