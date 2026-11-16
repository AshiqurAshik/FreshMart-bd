import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Order, OrderItem } from "./entities/orders.entity";
import { Cart } from "../carts/entities/carts.entity";
import { Product } from "../products/entities/products.entity";
import { User } from "../user/entities/user.entity";
import { Address } from "../addresse/entities/address.entity";
import { CreateOrderDto, UpdateStatusDto } from "./dto/orders.dto";

const DELIVERY_CHARGE: Record<string, number> = {
  inside_dhaka: 60,
  outside_dhaka: 120,
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // PLACE ORDER (FORCES VERIFIED AUTHENTICATED USER ID)
  async checkout(userId: string, dto: CreateOrderDto) {
    return await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException("User not found");
      }

      const address = await manager.findOne(Address, {
        where: { id: dto.address_id, user_id: userId },
      });
      if (!address) {
        throw new NotFoundException("Address not found or does not belong to you");
      }

      const cartItems = await manager.find(Cart, {
        where: { user: { id: userId } },
        relations: ["product"],
      });
      if (!cartItems.length) {
        throw new BadRequestException("Your cart is empty");
      }

      let subtotal = 0;
      const orderItems: OrderItem[] = [];
      for (const item of cartItems) {
        const product = item.product;
        if (!product) {
          throw new NotFoundException(
            `Product not found for ${item.product_name}`,
          );
        }
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}. Only ${product.stock} left.`,
          );
        }

        const price = Number(product.price);
        subtotal += price * item.quantity;

        orderItems.push({
          product_id: product.id,
          name: product.name,
          brand: product.brand,
          image_url: product.image_url,
          price,
          quantity: item.quantity,
          unit: product.unit,
        });
      }

      for (const item of cartItems) {
        const product = item.product;
        product.stock = product.stock - item.quantity;
        await manager.save(product);
      }

      const deliveryCharge = DELIVERY_CHARGE[address.delivery_zone];
      const discount = dto.discount_amount ?? 0;
      const totalAmount = subtotal + deliveryCharge - discount;
      if (totalAmount < 0) {
        throw new BadRequestException(
          "Discount cannot be greater than order total",
        );
      }

      const order = manager.create(Order, {
        order_number: this.generateOrderNumber(),
        user: { id: userId } as User,
        user_email: user.email,
        items: orderItems,
        recipient_name: address.full_name,
        phone: address.phone,
        delivery_address: address.address_line,
        area: address.area,
        city: address.city,
        delivery_zone: address.delivery_zone,
        subtotal,
        delivery_charge: deliveryCharge,
        discount_amount: discount,
        total_amount: totalAmount,
        payment_method: dto.payment_method,
        payment_status: "pending",
        order_status: "pending",
        customer_note: dto.customer_note,
      });
      const savedOrder = await manager.save(order);

      await manager.delete(Cart, { user: { id: userId } });

      return savedOrder;
    });
  }

  // GET ORDERS FOR A SPECIFIC USER
  async getMyOrders(userId: string) {
    try {
      return await this.orderRepository.find({
        where: { user: { id: userId } },
        order: { created_at: "DESC" },
      });
    } catch (error) {
      throw error;
    }
  }

  // GET ALL ORDERS (ADMIN & SUPER ADMIN)
  async getAllOrders() {
    try {
      return await this.orderRepository.find({
        order: { created_at: "DESC" },
      });
    } catch (error) {
      throw error;
    }
  }

  // GET ORDER BY ID WITH OWNERSHIP CHECK
  async getOrderById(id: string, userId: string, isAdminOrSuperAdmin: boolean) {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: id },
        relations: ["user"],
      });
      if (!order) {
        throw new NotFoundException("Order not found");
      }
      if (!isAdminOrSuperAdmin && order.user.id !== userId) {
        throw new ForbiddenException("You do not have permission to view this order");
      }

      // If accessed by an admin, return order snapshot without exposing user profile details
      if (isAdminOrSuperAdmin && order.user) {
        const { password_hash, ...safeUser } = order.user as any;
        order.user = safeUser;
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  // UPDATE ORDER STATUS (ADMIN & SUPER ADMIN)
  async updateStatus(id: string, dto: UpdateStatusDto) {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: id },
      });
      if (!order) {
        throw new NotFoundException("Order not found");
      }

      if (order.order_status === "delivered") {
        throw new BadRequestException("Order is already delivered");
      }
      if (order.order_status === "cancelled") {
        throw new BadRequestException("Order is already cancelled");
      }
      if (
        dto.order_status === "cancelled" &&
        order.order_status === "shipped"
      ) {
        throw new BadRequestException("A shipped order cannot be cancelled");
      }

      Object.assign(order, dto);
      const { id: uid, ...rest } = order;
      await this.orderRepository.update({ id: id }, rest);
      return await this.orderRepository.findOne({ where: { id: id } });
    } catch (error) {
      throw error;
    }
  }

  // CANCEL ORDER (CUSTOMER CAN CANCEL THEIR OWN ORDER ACCORDING TO BUSINESS RULES)
  async cancelOrder(id: string, userId: string, isAdminOrSuperAdmin: boolean) {
    try {
      const order = await this.orderRepository.findOne({
        where: { id },
        relations: ["user"],
      });
      if (!order) {
        throw new NotFoundException("Order not found");
      }

      // Ownership check for customer
      if (!isAdminOrSuperAdmin && order.user.id !== userId) {
        throw new ForbiddenException("You do not have permission to cancel this order");
      }

      if (order.order_status === "delivered") {
        throw new BadRequestException("Delivered orders cannot be cancelled");
      }
      if (order.order_status === "cancelled") {
        throw new BadRequestException("Order is already cancelled");
      }
      if (order.order_status === "shipped") {
        throw new BadRequestException("A shipped order cannot be cancelled");
      }

      // Restrict customer cancellation to initial states
      if (!isAdminOrSuperAdmin && !["pending", "confirmed"].includes(order.order_status)) {
        throw new BadRequestException("Order cannot be cancelled in its current status");
      }

      await this.orderRepository.update({ id }, { order_status: "cancelled" });
      return await this.orderRepository.findOne({ where: { id } });
    } catch (error) {
      throw error;
    }
  }

  private generateOrderNumber(): string {
    return `AWT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}
