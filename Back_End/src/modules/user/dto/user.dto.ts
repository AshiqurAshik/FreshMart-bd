import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    IsOptional,
    IsIn,
} from "class-validator";

export class CreateUserDto {

    @IsString()
    @IsNotEmpty({ message: "Name is mandatory" })
    @MaxLength(100)
    name!: string;

    @IsEmail()
    @IsNotEmpty()
    @MaxLength(150)
    email!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    phone!: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
        message: "Password must contain uppercase, lowercase, number and special characters"
    })
    password!: string;
}

export class CreateAdminDto {

    @IsString()
    @IsNotEmpty({ message: "Name is mandatory" })
    @MaxLength(100)
    name!: string;

    @IsEmail()
    @IsNotEmpty()
    @MaxLength(150)
    email!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    phone!: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
        message: "Password must contain uppercase, lowercase, number and special character"
    })
    password!: string;
}

export class UpdateUserDto {

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    phone?: string;
}

export class ChangeRoleDto {

    @IsIn(["customer", "admin", "super_admin"], {
        message: "Role must be customer, admin, or super_admin",
    })
    @IsNotEmpty()
    role!: string;
}

export class ChangeStatusDto {

    @IsIn(["active", "inactive", "banned"], {
        message: "Account status must be active, inactive, or banned",
    })
    @IsNotEmpty()
    account_status!: string;
}
