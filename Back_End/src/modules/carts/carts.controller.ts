import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { CartsService } from "./carts.service";
import { AddToCartDto, UpdateCartDto } from "./dto/carts.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("carts")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("customer", "super_admin")
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  // GET OWN CART
  @Get()
  async getMyCart(@Req() req: any) {
    const userId = req.user.user_id;
    return await this.cartsService.getCart(userId);
  }

  // GET CART BY USER ID (WITH OWNERSHIP CHECK)
  @Get(":userId")
  async getCart(@Req() req: any, @Param("userId") userId: string) {
    if (req.user.role === "customer" && req.user.user_id !== userId) {
      throw new ForbiddenException("You cannot access another customer's cart");
    }
    return await this.cartsService.getCart(userId);
  }

  // ADD TO OWN CART (NEVER TRUST USER_ID FROM BODY)
  @Post()
  async addToCart(
    @Req() req: any,
    @Body(new ValidationPipe()) dto: AddToCartDto,
  ) {
    const userId = req.user.user_id;
    return await this.cartsService.addToCart(userId, dto);
  }

  // UPDATE CART ITEM (OWN CART)
  @Patch(":userId/:id")
  async updateCartItemWithUser(
    @Req() req: any,
    @Param("userId") userId: string,
    @Param("id") id: string,
    @Body(new ValidationPipe()) dto: UpdateCartDto,
  ) {
    if (req.user.role === "customer" && req.user.user_id !== userId) {
      throw new ForbiddenException("You cannot update another customer's cart");
    }
    const targetUserId = req.user.role === "super_admin" ? userId : req.user.user_id;
    return await this.cartsService.updateCartItem(targetUserId, id, dto);
  }

  // UPDATE CART ITEM DIRECTLY
  @Patch(":id")
  async updateCartItem(
    @Req() req: any,
    @Param("id") id: string,
    @Body(new ValidationPipe()) dto: UpdateCartDto,
  ) {
    const userId = req.user.user_id;
    return await this.cartsService.updateCartItem(userId, id, dto);
  }

  // REMOVE CART ITEM (WITH USER ID IN PATH)
  @Delete(":userId/:id")
  async removeCartItemWithUser(
    @Req() req: any,
    @Param("userId") userId: string, 
    @Param("id") id: string
  ) {
    if (req.user.role === "customer" && req.user.user_id !== userId) {
      throw new ForbiddenException("You cannot modify another customer's cart");
    }
    const targetUserId = req.user.role === "super_admin" ? userId : req.user.user_id;
    return await this.cartsService.removeCartItem(targetUserId, id);
  }

  // REMOVE CART ITEM DIRECTLY
  @Delete("item/:id")
  async removeCartItem(
    @Req() req: any,
    @Param("id") id: string
  ) {
    const userId = req.user.user_id;
    return await this.cartsService.removeCartItem(userId, id);
  }

  // CLEAR CART (WITH USER ID IN PATH)
  @Delete(":userId")
  async clearCartWithUser(
    @Req() req: any,
    @Param("userId") userId: string
  ) {
    if (req.user.role === "customer" && req.user.user_id !== userId) {
      throw new ForbiddenException("You cannot clear another customer's cart");
    }
    const targetUserId = req.user.role === "super_admin" ? userId : req.user.user_id;
    return await this.cartsService.clearCart(targetUserId);
  }

  // CLEAR OWN CART
  @Delete()
  async clearCart(@Req() req: any) {
    const userId = req.user.user_id;
    return await this.cartsService.clearCart(userId);
  }
}
