import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto, UpdateStatusDto } from "./dto/orders.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("orders")
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // PLACE ORDER (CUSTOMER & SUPER ADMIN ONLY; FORCES AUTHENTICATED USER ID)
  @Roles("customer", "super_admin")
  @Post("checkout")
  async checkout(
    @Req() req: any,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false })) dto: CreateOrderDto,
  ) {
    const userId = req.user.user_id;
    return await this.ordersService.checkout(userId, dto);
  }

  // GET OWN ORDERS
  @Roles("customer", "admin", "super_admin")
  @Get("my-orders")
  async getMyOrdersSelf(@Req() req: any) {
    const userId = req.user.user_id;
    return await this.ordersService.getMyOrders(userId);
  }

  // GET ORDERS BY USER ID (WITH OWNERSHIP CHECK)
  @Roles("customer", "admin", "super_admin")
  @Get("my-orders/:userId")
  async getMyOrders(@Req() req: any, @Param("userId") userId: string) {
    if (req.user.role === "customer" && req.user.user_id !== userId) {
      throw new ForbiddenException("You cannot view another customer's orders");
    }
    return await this.ordersService.getMyOrders(userId);
  }

  // GET ALL ORDERS (ADMIN & SUPER ADMIN ONLY)
  @Roles("admin", "super_admin")
  @Get()
  async getAllOrders() {
    return await this.ordersService.getAllOrders();
  }

  // GET SINGLE ORDER (WITH OWNERSHIP CHECK FOR CUSTOMER)
  @Roles("customer", "admin", "super_admin")
  @Get(":id")
  async getOrderById(@Req() req: any, @Param("id") id: string) {
    const isAdminOrSuperAdmin = ["admin", "super_admin"].includes(req.user.role);
    return await this.ordersService.getOrderById(id, req.user.user_id, isAdminOrSuperAdmin);
  }

  // UPDATE ORDER STATUS (ADMIN & SUPER ADMIN ONLY)
  @Roles("admin", "super_admin")
  @Patch(":id/status")
  async updateStatus(
    @Param("id") id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) dto: UpdateStatusDto,
  ) {
    return await this.ordersService.updateStatus(id, dto);
  }

  // CANCEL ORDER (CUSTOMER CAN CANCEL OWN ORDER WHEN RULES PERMIT; ADMIN & SUPER ADMIN)
  @Roles("customer", "admin", "super_admin")
  @Patch(":id/cancel")
  async cancelOrder(
    @Req() req: any,
    @Param("id") id: string,
  ) {
    const isAdminOrSuperAdmin = ["admin", "super_admin"].includes(req.user.role);
    return await this.ordersService.cancelOrder(id, req.user.user_id, isAdminOrSuperAdmin);
  }
}
