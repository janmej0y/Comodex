import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ProductTrendPointModel {
  @Field()
  label!: string;

  @Field(() => Int)
  value!: number;
}