import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class PurchaseOrderLineModel {
  @Field()
  id!: string;

  @Field()
  productId!: string;

  @Field(() => Int)
  quantityOrdered!: number;

  @Field(() => Int)
  quantityReceived!: number;

  @Field(() => Float)
  unitPrice!: number;
}

