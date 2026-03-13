import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { RoleEnum } from "../common/enums/role.enum";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { ProductsService } from "../products/products.service";
import { AdjustStockInput } from "../products/dto/adjust-stock.input";
import { UpsertProductInput } from "../products/dto/upsert-product.input";
import { AuthService } from "./auth.service";
import { LoginInput } from "./dto/login.input";
import { RefreshSessionInput } from "./dto/refresh-session.input";
import { SignupInput } from "./dto/signup.input";

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly productsService: ProductsService
  ) {}

  @Post("auth/signup")
  signup(@Body() input: SignupInput) {
    return this.authService.signup(input);
  }

  @Post("auth/login")
  login(@Body() input: LoginInput) {
    return this.authService.login(input);
  }

  @Post("auth/refresh")
  refresh(@Body() input: RefreshSessionInput) {
    return this.authService.refreshSession(input);
  }

  @Post("auth/logout")
  logout(@Body("refreshToken") refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @Get("products")
  @UseGuards(JwtAuthGuard)
  products() {
    return this.productsService.products();
  }

  @Post("products")
  @UseGuards(JwtAuthGuard)
  createProduct(@Body() input: UpsertProductInput, @Req() req: { user: { id: string; role: string } }) {
    return this.productsService.upsertProduct(input, req.user);
  }

  @Put("products/:id")
  @UseGuards(JwtAuthGuard)
  updateProduct(@Param("id") id: string, @Body() input: UpsertProductInput, @Req() req: { user: { id: string; role: string } }) {
    return this.productsService.upsertProduct({ ...input, id }, req.user);
  }

  @Post("products/:id/adjust")
  @UseGuards(JwtAuthGuard)
  adjustProduct(@Param("id") id: string, @Body() input: AdjustStockInput, @Req() req: { user: { id: string; role: string } }) {
    return this.productsService.adjustStock({ ...input, productId: id }, req.user);
  }

  @Get("dashboard")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.MANAGER)
  dashboard() {
    return { allowed: true };
  }
}