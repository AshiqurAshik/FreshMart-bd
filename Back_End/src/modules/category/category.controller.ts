import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  UseGuards,
} from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller(["categories", "category"])
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // PUBLIC: Anyone can browse categories
  @Get()
  async getCategories(@Query("include_products") includeProducts?: string) {
    const shouldInclude = includeProducts === "true" || includeProducts === "1";
    return await this.categoryService.getCategories(shouldInclude);
  }

  // PUBLIC: Anyone can view category details
  @Get(":id")
  async getCategory(
    @Param("id") id: string,
    @Query("include_products") includeProducts?: string,
  ) {
    const shouldInclude = includeProducts === "true" || includeProducts === "1";
    return await this.categoryService.getCategory(id, shouldInclude);
  }

  // ADMIN & SUPER ADMIN: Create category
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  @Post()
  async createCategory(@Body(new ValidationPipe()) dto: CreateCategoryDto) {
    return await this.categoryService.createCategory(dto);
  }

  // ADMIN & SUPER ADMIN: Update category
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  @Patch(":id")
  async updateCategory(
    @Param("id") id: string,
    @Body(new ValidationPipe()) dto: UpdateCategoryDto,
  ) {
    return await this.categoryService.updateCategory(id, dto);
  }

  // ADMIN & SUPER ADMIN: Delete category (respects product association constraint)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "super_admin")
  @Delete(":id")
  async deleteCategory(@Param("id") id: string) {
    return await this.categoryService.deleteCategory(id);
  }
}
