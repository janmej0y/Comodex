import { Field, ObjectType } from "@nestjs/graphql";
import { MovementTypeEnum } from "../../common/enums/movement-type.enum";

@ObjectType()
export class ProductMovementModel {
  @Field()
  id!: string;

  @Field()
  productId!: string;

  @Field(() => MovementTypeEnum)
  type!: MovementTypeEnum;

  @Field()
  quantity!: number;

  @Field()
  reason!: string;

  @Field()
  createdAt!: Date;
}