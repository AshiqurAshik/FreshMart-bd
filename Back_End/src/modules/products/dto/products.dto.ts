import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsInt,
    IsUrl,
    IsUUID,
    Min,
    MaxLength,
} from "class-validator";

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    name!: string;

    @IsUUID()
    @IsNotEmpty()
    category_id!: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    brand?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUrl()
    image_url?: string;

    @IsNumber()
    @Min(0)
    price!: number;

    @IsInt()
    @Min(0)
    stock!: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    unit!: string;
}

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    name?: string;

    @IsOptional()
    @IsUUID()
    category_id?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    brand?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUrl()
    image_url?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    stock?: number;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    unit?: string;
}
