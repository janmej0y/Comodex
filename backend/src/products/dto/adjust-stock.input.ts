import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsString } from "class-validator";

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
}