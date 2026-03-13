import { Field, InputType, Int } from "@nestjs/graphql";
import { IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator";

@InputType()
export class SaveAlertRuleInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  id?: string;

  @Field()
  @IsString()
  name!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  threshold!: number;

  @Field()
  @IsString()
  channel!: string;

  @Field({ defaultValue: true })
  @IsBoolean()
  isActive: boolean = true;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  productId?: string;
}

