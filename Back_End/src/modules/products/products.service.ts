import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./entities/products.entity";
import { Category } from "../category/entities/category.entity";
import {
    CreateProductDto,
    UpdateProductDto,
} from "./dto/products.dto";

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) {}

    async getProducts(includeCategory = true) {
        try {
            return await this.productRepository.find({
                relations: includeCategory ? ["category"] : [],
                order: { name: "ASC" },
            });
        } catch (error) {
            throw error;
        }
    }

    async getProduct(id: string, includeCategory = true) {
        try {
            const product = await this.productRepository.findOne({
                where: { id },
                relations: includeCategory ? ["category"] : [],
            });
            if (!product) {
                throw new NotFoundException("Product not found");
            }
            return product;
        } catch (error) {
            throw error;
        }
    }

    async createProduct(dto: CreateProductDto) {
        try {
            const category = await this.categoryRepository.findOne({
                where: { id: dto.category_id },
            });

            if (!category) {
                throw new NotFoundException("Category not found");
            }

            if (dto.price < 0) {
                throw new BadRequestException("Price cannot be negative");
            }

            if (dto.stock < 0) {
                throw new BadRequestException("Stock cannot be negative");
            }

            const product = this.productRepository.create(dto);
            const saved = await this.productRepository.save(product);
            return await this.getProduct(saved.id, true);
        } catch (error) {
            throw error;
        }
    }

    async updateProduct(id: string, dto: UpdateProductDto) {
        try {
            if (!id) {
                throw new NotFoundException("Product not found");
            }

            const product = await this.productRepository.findOne({
                where: { id: id },
            });

            if (!product) {
                throw new NotFoundException("Product not found");
            }

            if (dto.category_id) {
                const category = await this.categoryRepository.findOne({
                    where: { id: dto.category_id },
                });
                if (!category) {
                    throw new NotFoundException("Category not found");
                }
            }

            if (dto.price !== undefined && dto.price < 0) {
                throw new BadRequestException("Price cannot be negative");
            }

            if (dto.stock !== undefined && dto.stock < 0) {
                throw new BadRequestException("Stock cannot be negative");
            }

            Object.assign(product, dto);
            product.updated_at = new Date();

            const saved = await this.productRepository.save(product);
            return await this.getProduct(saved.id, true);
        } catch (error) {
            throw error;
        }
    }

    async deleteProduct(id: string) {
        try {
            const product = await this.productRepository.findOne({
                where: { id: id },
            });

            if (!product) {
                throw new NotFoundException("Product not found");
            }

            return await this.productRepository.delete({ id: id });
        } catch (error) {
            throw error;
        }
    }
}
