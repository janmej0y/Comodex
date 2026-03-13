import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "../common/guards/gql-auth.guard";
import { ProductsService } from "./products.service";
import { ProductModel } from "./models/product.model";
import { ProductMovementModel } from "./models/product-movement.model";
import { ProductTrendPointModel } from "./models/product-trend-point.model";
import { UpsertProductInput } from "./dto/upsert-product.input";
import { AdjustStockInput } from "./dto/adjust-stock.input";

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

  @Query(() => [ProductMovementModel])
  productMovements(@Args("productId") productId: string) {
    return this.productsService.productMovements(productId);
  }

  @Query(() => [ProductTrendPointModel])
  productTrend(@Args("productId") productId: string) {
    return this.productsService.productTrend(productId);
  }

  @Mutation(() => ProductModel)
  upsertProduct(@Args("input") input: UpsertProductInput) {
    return this.productsService.upsertProduct(input);
  }

  @Mutation(() => ProductModel)
  adjustStock(@Args("input") input: AdjustStockInput) {
    return this.productsService.adjustStock(input);
  }
}