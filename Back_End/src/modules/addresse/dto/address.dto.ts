import {
    IsString,
    IsNotEmpty,
    IsUUID,
    IsOptional,
    IsBoolean,
    IsIn,
    MaxLength
} from "class-validator";

export class CreateAddressDto {

    @IsUUID()
    @IsNotEmpty()
    user_id!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    full_name!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    phone!: string;

    @IsString()
    @IsNotEmpty()
    address_line!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    area!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    city!: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    postal_code?: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(["inside_dhaka", "outside_dhaka"])
    delivery_zone!: string;

    @IsOptional()
    @IsBoolean()
    is_default?: boolean;
}

export class UpdateAddressDto {

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    full_name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    phone?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    address_line?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    area?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    city?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    postal_code?: string;

    @IsOptional()
    @IsString()
    @IsIn(["inside_dhaka", "outside_dhaka"])
    delivery_zone?: string;

    @IsOptional()
    @IsBoolean()
    is_default?: boolean;
}