import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class DashboardStatsModel {
  @Field(() => Int)
  totalStock!: number;

  @Field(() => Float)
  marketValue!: number;

  @Field(() => Int)
  lowInventory!: number;
}