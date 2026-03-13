import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class GoodsReceiptLineModel {
  @Field()
  id!: string;

  @Field()
  productId!: string;

  @Field(() => Int)
  quantity!: number;
}

