import { Args, Int, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { RoleEnum } from "../common/enums/role.enum";
import { GqlAuthGuard } from "../common/guards/gql-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AuditService } from "./audit.service";
import { AuditEventModel } from "./models/audit-event.model";

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
export class AuditResolver {
  constructor(private readonly auditService: AuditService) {}

  @Query(() => [AuditEventModel])
  @Roles(RoleEnum.MANAGER)
  auditTrail(@Args("limit", { type: () => Int, nullable: true, defaultValue: 30 }) limit: number) {
    return this.auditService.auditTrail(limit);
  }
}

