import { Injectable } from "@nestjs/common";
import { ProductsService } from "../products/products.service";

@Injectable()
export class DashboardService {
  constructor(private readonly productsService: ProductsService) {}

  async dashboardStats() {
    const products = await this.productsService.statsFromProducts();

    const totalStock = products.reduce((sum, item) => sum + item.quantity, 0);
    const marketValue = products.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const lowInventory = products.filter((item) => item.quantity <= 40).length;

    return {
      totalStock,
      marketValue,
      lowInventory
    };
  }
}