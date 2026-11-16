import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./entities/products.entity";
import { Category } from "../category/entities/category.entity";
import { ProductController } from "./products.controller";
import { ProductService } from "./products.service";

@Module({
    imports: [TypeOrmModule.forFeature([Product, Category])],
    controllers: [ProductController],
    providers: [ProductService],
    exports: [ProductService],
})
export class ProductModule {}
