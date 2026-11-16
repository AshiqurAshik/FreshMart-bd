import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ValidationPipe,
    UseGuards,
} from "@nestjs/common";

import { ProductService } from "./products.service";
import { CreateProductDto, UpdateProductDto } from "./dto/products.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("products")
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    // PUBLIC: All users and guests can view products
    @Get()
    async getProducts() {
        return await this.productService.getProducts();
    }

    // PUBLIC: All users and guests can view a single product
    @Get(":id")
    async getProduct(@Param("id") id: string) {
        return await this.productService.getProduct(id);
    }

    // ADMIN & SUPER ADMIN: Create products
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("admin", "super_admin")
    @Post()
    async createProduct(@Body(new ValidationPipe()) dto: CreateProductDto) {
        return await this.productService.createProduct(dto);
    }

    // ADMIN & SUPER ADMIN: Update products
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("admin", "super_admin")
    @Patch(":id")
    async updateProduct(
        @Param("id") id: string,
        @Body(new ValidationPipe()) dto: UpdateProductDto,
    ) {
        return await this.productService.updateProduct(id, dto);
    }

    // ADMIN & SUPER ADMIN: Delete products
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("admin", "super_admin")
    @Delete(":id")
    async deleteProduct(@Param("id") id: string) {
        return await this.productService.deleteProduct(id);
    }
}
