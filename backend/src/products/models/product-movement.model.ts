import { Field, Int, ObjectType } from "@nestjs/graphql";
import { MovementTypeEnum } from "../../common/enums/movement-type.enum";

@ObjectType()
export class ProductMovementModel {
  @Field()
  id!: string;

  @Field()
  productId!: string;

  @Field(() => MovementTypeEnum)
  type!: MovementTypeEnum;

  @Field(() => Int)
  quantity!: number;

  @Field({ nullable: true })
  warehouseId?: string;

  @Field()
  reason!: string;

  @Field()
  createdAt!: Date;
}

