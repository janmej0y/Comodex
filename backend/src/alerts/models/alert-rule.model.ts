import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AlertRuleModel {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => Int)
  threshold!: number;

  @Field()
  channel!: string;

  @Field(() => Boolean)
  isActive!: boolean;

  @Field({ nullable: true })
  warehouseId?: string;

  @Field({ nullable: true })
  productId?: string;

  @Field()
  createdAt!: Date;
}

