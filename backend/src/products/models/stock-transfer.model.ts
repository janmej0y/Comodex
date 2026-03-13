import { Field, Int, ObjectType } from "@nestjs/graphql";
import { TransferStatusEnum } from "../../common/enums/transfer-status.enum";

@ObjectType()
export class StockTransferModel {
  @Field()
  id!: string;

  @Field()
  reference!: string;

  @Field()
  productId!: string;

  @Field()
  fromWarehouseId!: string;

  @Field()
  toWarehouseId!: string;

  @Field(() => Int)
  quantity!: number;

  @Field(() => TransferStatusEnum)
  status!: TransferStatusEnum;

  @Field()
  createdAt!: Date;
}

