import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart } from "./entities/carts.entity";
import { Product } from "../products/entities/products.entity";
import { User } from "../user/entities/user.entity";
import { AddToCartDto, UpdateCartDto } from "./dto/carts.dto";

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getCart(userId: string) {
    try {
      const items = await this.cartRepository.find({
        where: { user: { id: userId } },
      });
      return this.calculateTotals(items);
    } catch (error) {
      throw error;
    }
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    try {
      const product = await this.productRepository.findOne({
        where: { id: dto.product_id },
      });
      if (!product) {
        throw new NotFoundException("Product not found");
      }
      if (product.stock < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}. Only ${product.stock} left.`,
        );
      }

      const existingItem = await this.cartRepository.findOne({
        where: {
          user: { id: userId },
          product: { id: dto.product_id },
        },
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity + dto.quantity;
        if (product.stock < newQuantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}. Only ${product.stock} left.`,
          );
        }
        existingItem.quantity = newQuantity;
        existingItem.price = product.price;
        return await this.cartRepository.save(existingItem);
      }

      const cartItem = this.cartRepository.create({
        user: { id: userId } as User,
        product,
        product_name: product.name,
        image_url: product.image_url,
        brand: product.brand,
        price: product.price,
        quantity: dto.quantity,
      });
      const response = await this.cartRepository.save(cartItem);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateCartItem(userId: string, id: string, dto: UpdateCartDto) {
    try {
      const cartItem = await this.cartRepository.findOne({
        where: { id: id, user: { id: userId } },
        relations: ["product"],
      });
      if (!cartItem) {
        throw new NotFoundException("Cart item not found");
      }
      if (cartItem.product.stock < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${cartItem.product_name}. Only ${cartItem.product.stock} left.`,
        );
      }
      Object.assign(cartItem, dto);
      const { id: uid, ...rest } = cartItem;
      return await this.cartRepository.update({ id: id }, rest);
    } catch (error) {
      throw error;
    }
  }

  async removeCartItem(userId: string, id: string) {
    try {
      const cartItem = await this.cartRepository.findOne({
        where: { id: id, user: { id: userId } },
      });
      if (!cartItem) {
        throw new NotFoundException("Cart item not found");
      }
      return await this.cartRepository.delete({ id: id });
    } catch (error) {
      throw error;
    }
  }

  async clearCart(userId: string) {
    try {
      return await this.cartRepository.delete({ user: { id: userId } });
    } catch (error) {
      throw error;
    }
  }

  private calculateTotals(items: Cart[]) {
    const cart_items = items.map((item) => ({
      ...item,
      line_total: Number(item.price) * item.quantity,
    }));
    const subtotal = cart_items.reduce(
      (sum, item) => sum + item.line_total,
      0,
    );
    return { cart_items, subtotal, item_count: items.length };
  }
}