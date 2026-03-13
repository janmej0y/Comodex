import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RoleEnum } from "../common/enums/role.enum";
import { GqlAuthGuard } from "../common/guards/gql-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { CreatePurchaseOrderInput } from "./dto/create-purchase-order.input";
import { ReceivePurchaseOrderInput } from "./dto/receive-purchase-order.input";
import { GoodsReceiptModel } from "./models/goods-receipt.model";
import { PurchaseOrderModel } from "./models/purchase-order.model";
import { ProcurementService } from "./procurement.service";

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
export class ProcurementResolver {
  constructor(private readonly procurementService: ProcurementService) {}

  @Query(() => [PurchaseOrderModel])
  purchaseOrders() {
    return this.procurementService.purchaseOrders();
  }

  @Query(() => [GoodsReceiptModel])
  goodsReceipts() {
    return this.procurementService.goodsReceipts();
  }

  @Mutation(() => PurchaseOrderModel)
  @Roles(RoleEnum.MANAGER)
  createPurchaseOrder(@Args("input") input: CreatePurchaseOrderInput, @CurrentUser() user: { id: string }) {
    return this.procurementService.createPurchaseOrder(input, user.id);
  }

  @Mutation(() => GoodsReceiptModel)
  @Roles(RoleEnum.MANAGER, RoleEnum.STORE_KEEPER)
  receivePurchaseOrder(@Args("input") input: ReceivePurchaseOrderInput, @CurrentUser() user: { id: string }) {
    return this.procurementService.receivePurchaseOrder(input, user.id);
  }
}

