import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { GqlAuthGuard } from "../common/guards/gql-auth.guard";
import { ProductsService } from "./products.service";
import { ProductModel } from "./models/product.model";
import { ProductMovementModel } from "./models/product-movement.model";
import { ProductTrendPointModel } from "./models/product-trend-point.model";
import { WarehouseModel } from "./models/warehouse.model";
import { StockTransferModel } from "./models/stock-transfer.model";
import { UpsertProductInput } from "./dto/upsert-product.input";
import { AdjustStockInput } from "./dto/adjust-stock.input";
import { TransferStockInput } from "./dto/transfer-stock.input";

@Resolver()
@UseGuards(GqlAuthGuard)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Query(() => [ProductModel])
  products() {
    return this.productsService.products();
  }

  @Query(() => ProductModel, { nullable: true })
  product(@Args("id") id: string) {
    return this.productsService.product(id);
  }

  @Query(() => [WarehouseModel])
  warehouses() {
    return this.productsService.warehouses();
  }

  @Query(() => [StockTransferModel])
  stockTransfers() {
    return this.productsService.stockTransfers();
  }

  @Query(() => [ProductMovementModel])
  productMovements(@Args("productId") productId: string) {
    return this.productsService.productMovements(productId);
  }

  @Query(() => [ProductTrendPointModel])
  productTrend(@Args("productId") productId: string) {
    return this.productsService.productTrend(productId);
  }

  @Mutation(() => ProductModel)
  upsertProduct(@Args("input") input: UpsertProductInput, @CurrentUser() user: { id: string; role: string }) {
    return this.productsService.upsertProduct(input, user);
  }

  @Mutation(() => ProductModel)
  adjustStock(@Args("input") input: AdjustStockInput, @CurrentUser() user: { id: string; role: string }) {
    return this.productsService.adjustStock(input, user);
  }

  @Mutation(() => StockTransferModel)
  transferStock(@Args("input") input: TransferStockInput, @CurrentUser() user: { id: string; role: string }) {
    return this.productsService.transferStock(input, user);
  }
}

