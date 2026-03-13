import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { WarehouseBalanceModel } from "./warehouse-balance.model";

@ObjectType()
export class ProductModel {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  category!: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => Float)
  unitPrice!: number;

  @Field(() => Int)
  quantity!: number;

  @Field(() => Int)
  reorderLevel!: number;

  @Field(() => Boolean)
  lowStock!: boolean;

  @Field()
  updatedAt!: Date;

  @Field(() => [WarehouseBalanceModel])
  balances!: WarehouseBalanceModel[];
}

