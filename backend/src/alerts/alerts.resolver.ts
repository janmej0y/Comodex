import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { GqlAuthGuard } from "../common/guards/gql-auth.guard";
import { AlertRuleModel } from "./models/alert-rule.model";
import { LowStockAlertModel } from "./models/low-stock-alert.model";
import { AlertsService } from "./alerts.service";
import { SaveAlertRuleInput } from "./dto/save-alert-rule.input";

@Resolver()
@UseGuards(GqlAuthGuard)
export class AlertsResolver {
  constructor(private readonly alertsService: AlertsService) {}

  @Query(() => [AlertRuleModel])
  alertRules() {
    return this.alertsService.alertRules();
  }

  @Query(() => [LowStockAlertModel])
  lowStockAlerts() {
    return this.alertsService.lowStockAlerts();
  }

  @Mutation(() => AlertRuleModel)
  saveAlertRule(@Args("input") input: SaveAlertRuleInput, @CurrentUser() user: { id: string }) {
    return this.alertsService.saveAlertRule(input, user.id);
  }
}

