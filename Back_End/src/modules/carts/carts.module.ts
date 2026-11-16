import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cart } from "./entities/carts.entity";
import { Product } from "../products/entities/products.entity";
import { CartsController } from "./carts.controller";
import { CartsService } from "./carts.service";

@Module({
  imports: [TypeOrmModule.forFeature([Cart, Product])],
  controllers: [CartsController],
  providers: [CartsService],
  exports: [CartsService],
})
export class CartsModule {}