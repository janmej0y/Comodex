import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsString, Min } from "class-validator";

@InputType()
export class TransferStockInput {
  @Field()
  @IsString()
  productId!: string;

  @Field()
  @IsString()
  fromWarehouseId!: string;

  @Field()
  @IsString()
  toWarehouseId!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity!: number;

  @Field()
  @IsString()
  reason!: string;
}

