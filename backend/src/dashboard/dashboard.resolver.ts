import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";
import { Roles } from "../common/decorators/roles.decorator";
import { RoleEnum } from "../common/enums/role.enum";
import { GqlAuthGuard } from "../common/guards/gql-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { DashboardStatsModel } from "./models/dashboard-stats.model";
import { DashboardService } from "./dashboard.service";

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
export class DashboardResolver {
  constructor(private readonly dashboardService: DashboardService) {}

  @Query(() => DashboardStatsModel)
  @Roles(RoleEnum.MANAGER)
  dashboardStats() {
    return this.dashboardService.dashboardStats();
  }
}