import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsEnum, MinLength } from "class-validator";
import { RoleEnum } from "../../common/enums/role.enum";

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @MinLength(6)
  password!: string;

  @Field(() => RoleEnum)
  @IsEnum(RoleEnum)
  role!: RoleEnum;
}