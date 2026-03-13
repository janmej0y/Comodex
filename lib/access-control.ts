import { Role } from "@/types/auth";

export const ACCESS_RULES = {
  dashboard: [Role.MANAGER],
  products: [Role.MANAGER, Role.STORE_KEEPER],
  productsWrite: [Role.MANAGER, Role.STORE_KEEPER],
  alerts: [Role.MANAGER, Role.STORE_KEEPER],
  warehouses: [Role.MANAGER],
  operations: [Role.MANAGER],
  audit: [Role.MANAGER]
} as const;

export type AccessKey = keyof typeof ACCESS_RULES;

export function hasAccess(role: Role | null | undefined, accessKey: AccessKey) {
  if (!role) {
    return false;
  }

  return (ACCESS_RULES[accessKey] as readonly Role[]).includes(role);
}

export function isManager(role: Role | null | undefined) {
  return role === Role.MANAGER;
}
