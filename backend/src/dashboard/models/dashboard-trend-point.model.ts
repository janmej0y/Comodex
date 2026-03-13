import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class DashboardTrendPointModel {
  @Field()
  label!: string;

  @Field(() => Float)
  value!: number;
}

