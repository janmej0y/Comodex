import { Field, Float, InputType, Int } from "@nestjs/graphql";
import { IsArray, IsInt, IsNumber, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

@InputType()
export class PurchaseOrderLineInput {
  @Field()
  @IsString()
  productId!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantityOrdered!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  unitPrice!: number;
}

@InputType()
export class CreatePurchaseOrderInput {
  @Field()
  @IsString()
  supplier!: string;

  @Field()
  @IsString()
  warehouseId!: string;

  @Field(() => [PurchaseOrderLineInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderLineInput)
  lines!: PurchaseOrderLineInput[];
}

