import { Field, ObjectType } from "@nestjs/graphql";
import { GoodsReceiptLineModel } from "./goods-receipt-line.model";

@ObjectType()
export class GoodsReceiptModel {
  @Field()
  id!: string;

  @Field()
  reference!: string;

  @Field()
  purchaseOrderId!: string;

  @Field()
  warehouseId!: string;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt!: Date;

  @Field(() => [GoodsReceiptLineModel])
  lines!: GoodsReceiptLineModel[];
}

