import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { RoleEnum } from "../enums/role.enum";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const contextType = context.getType<"http" | "graphql">();
    const user =
      contextType === "http"
        ? (context.switchToHttp().getRequest().user as { role?: RoleEnum } | undefined)
        : (GqlExecutionContext.create(context).getContext().req.user as { role?: RoleEnum } | undefined);

    return !!user?.role && requiredRoles.includes(user.role);
  }
}
