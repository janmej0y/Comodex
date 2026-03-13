import { registerEnumType } from "@nestjs/graphql";

export enum RoleEnum {
  MANAGER = "MANAGER",
  STORE_KEEPER = "STORE_KEEPER"
}

registerEnumType(RoleEnum, { name: "Role" });