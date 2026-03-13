import { Field, InputType, Int } from "@nestjs/graphql";
import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

@InputType()
export class GoodsReceiptLineInput {
  @Field()
  @IsString()
  productId!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity!: number;
}

@InputType()
export class ReceivePurchaseOrderInput {
  @Field()
  @IsString()
  purchaseOrderId!: string;

  @Field(() => [GoodsReceiptLineInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsReceiptLineInput)
  lines!: GoodsReceiptLineInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

