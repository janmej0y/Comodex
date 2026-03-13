import { Field, Float, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsNumber, IsPositive, IsString, Min } from "class-validator";

@InputType()
export class UpsertProductInput {
  @Field()
  @IsString()
  id!: string;

  @Field()
  @IsString()
  name!: string;

  @Field()
  @IsString()
  category!: string;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  unitPrice!: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  quantity!: number;
}