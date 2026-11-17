import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    ValidationPipe,
    UseGuards,
} from "@nestjs/common";
import { Request, Response } from "express";

import { AuthService } from "./auth.service";

import {
    AuthDto,
    RefreshTokenDto,
    LogoutDto,
} from "./dto/auth.dto";

import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import {
    setAuthCookies,
    clearAuthCookies,
    AUTH_COOKIE_NAMES,
} from "./auth-cookies";

@Controller("auth")
export class AuthController {

    constructor(
        private authService: AuthService
    ) {}

    @HttpCode(HttpStatus.OK)
    @Post("login")
    async login(
        @Body(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        }))
        dto: AuthDto,
        @Res({ passthrough: true }) res: Response,
    ) {

        const result = await this.authService.signIn(dto);

        setAuthCookies(res, {
            access_token: result.access_token,
            refresh_token: result.refresh_token,
        });

        return result;

    }

    @HttpCode(HttpStatus.OK)
    @Post("refresh")
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Body(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: false,
        }))
        dto?: RefreshTokenDto,
    ) {

        const refreshToken =
            req.cookies?.[AUTH_COOKIE_NAMES.REFRESH_TOKEN] ||
            req.cookies?.refreshToken ||
            dto?.refresh_token;

        const result = await this.authService.refreshToken(
            refreshToken
        );

        setAuthCookies(res, {
            access_token: result.access_token,
            refresh_token: result.refresh_token,
        });

        return result;

    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post("logout")
    async logout(
        @Req() req: any,
        @Res({ passthrough: true }) res: Response,
        @Body(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: false,
        }))
        dto?: LogoutDto,
    ) {

        const userId = req.user?.user_id || req.user?.id;
        const refreshToken =
            req.cookies?.[AUTH_COOKIE_NAMES.REFRESH_TOKEN] ||
            req.cookies?.refreshToken ||
            dto?.refresh_token;

        const result = await this.authService.logout(
            userId,
            refreshToken
        );

        clearAuthCookies(res);

        return result;

    }

}
