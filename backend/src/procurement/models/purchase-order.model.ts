import { Field, ObjectType } from "@nestjs/graphql";
import { PurchaseOrderStatusEnum } from "../../common/enums/purchase-order-status.enum";
import { PurchaseOrderLineModel } from "./purchase-order-line.model";

@ObjectType()
export class PurchaseOrderModel {
  @Field()
  id!: string;

  @Field()
  reference!: string;

  @Field()
  supplier!: string;

  @Field(() => PurchaseOrderStatusEnum)
  status!: PurchaseOrderStatusEnum;

  @Field()
  warehouseId!: string;

  @Field()
  createdAt!: Date;

  @Field(() => [PurchaseOrderLineModel])
  lines!: PurchaseOrderLineModel[];
}

