import { Field, ObjectType } from "@nestjs/graphql";
import { RoleEnum } from "../../common/enums/role.enum";

@ObjectType()
export class UserModel {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field(() => RoleEnum)
  role!: RoleEnum;
}