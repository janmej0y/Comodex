import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class LowStockAlertModel {
  @Field()
  productId!: string;

  @Field()
  productName!: string;

  @Field()
  warehouseId!: string;

  @Field()
  warehouseName!: string;

  @Field(() => Int)
  quantity!: number;

  @Field(() => Int)
  threshold!: number;

  @Field()
  severity!: string;
}

