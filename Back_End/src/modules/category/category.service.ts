import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "./entities/category.entity";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";
import { Product } from "../products/entities/products.entity";

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getCategories(includeProducts = false) {
    try {
      return await this.categoryRepository.find({
        relations: includeProducts ? ["products"] : [],
        order: { name: "ASC" },
      });
    } catch (error) {
      throw error;
    }
  }

  async getCategory(id: string, includeProducts = false) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id },
        relations: includeProducts ? ["products"] : [],
      });
      if (!category) {
        throw new NotFoundException("Category not found");
      }
      return category;
    } catch (error) {
      throw error;
    }
  }

  async createCategory(dto: CreateCategoryDto) {
    try {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: dto.name },
      });

      if (existingCategory) {
        throw new BadRequestException("Category already exists");
      }

      const category = this.categoryRepository.create(dto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      throw error;
    }
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException("Category not found");
      }

      if (dto.name && dto.name !== category.name) {
        const existingCategory = await this.categoryRepository.findOne({
          where: { name: dto.name },
        });

        if (existingCategory) {
          throw new BadRequestException("Category already exists");
        }
      }

      Object.assign(category, dto);
      category.updated_at = new Date();

      return await this.categoryRepository.save(category);
    } catch (error) {
      throw error;
    }
  }

  async deleteCategory(id: string) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException("Category not found");
      }

      const productCount = await this.productRepository.count({
        where: { category_id: id },
      });

      if (productCount > 0) {
        throw new BadRequestException(
          `Cannot delete category. ${productCount} product(s) are assigned to this category.`,
        );
      }

      await this.categoryRepository.delete({ id });
      return { message: "Category deleted successfully" };
    } catch (error) {
      throw error;
    }
  }
}
