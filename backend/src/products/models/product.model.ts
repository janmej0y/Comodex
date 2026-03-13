import { Field, Float, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ProductModel {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  category!: string;

  @Field(() => Float)
  unitPrice!: number;

  @Field()
  quantity!: number;

  @Field()
  updatedAt!: Date;
}