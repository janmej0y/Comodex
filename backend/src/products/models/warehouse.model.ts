import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class WarehouseModel {
  @Field()
  id!: string;

  @Field()
  code!: string;

  @Field()
  name!: string;

  @Field()
  city!: string;

  @Field(() => Int)
  totalUnits!: number;

  @Field(() => Int)
  lowStockSkus!: number;
}

