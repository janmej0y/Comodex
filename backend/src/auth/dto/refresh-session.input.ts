import { Field, InputType } from "@nestjs/graphql";
import { IsString, MinLength } from "class-validator";

@InputType()
export class RefreshSessionInput {
  @Field()
  @IsString()
  @MinLength(16)
  refreshToken!: string;
}

