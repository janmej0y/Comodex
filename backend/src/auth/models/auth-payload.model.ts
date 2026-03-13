import { Field, ObjectType } from "@nestjs/graphql";
import { UserModel } from "./user.model";

@ObjectType()
export class AuthPayload {
  @Field()
  token!: string;

  @Field()
  refreshToken!: string;

  @Field(() => UserModel)
  user!: UserModel;
}

