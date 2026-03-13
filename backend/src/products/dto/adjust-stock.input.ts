import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsOptional, IsString } from "class-validator";

@InputType()
export class AdjustStockInput {
  @Field()
  @IsString()
  productId!: string;

  @Field(() => Int)
  @IsInt()
  delta!: number;

  @Field()
  @IsString()
  reason!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  warehouseId?: string;
}

