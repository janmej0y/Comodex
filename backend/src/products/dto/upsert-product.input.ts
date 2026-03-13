import { Field, Float, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator";

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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  unitPrice!: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  quantity!: number;

  @Field(() => Int, { defaultValue: 40 })
  @IsInt()
  @Min(1)
  reorderLevel: number = 40;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  warehouseId?: string;
}

