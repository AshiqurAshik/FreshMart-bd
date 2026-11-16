import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
} from "class-validator";

export class AuthDto {

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;

}

export class RefreshTokenDto {

    @IsString()
    @IsOptional()
    refresh_token?: string;

}

export class LogoutDto {

    @IsString()
    @IsOptional()
    refresh_token?: string;

}
