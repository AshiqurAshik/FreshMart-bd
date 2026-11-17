import {
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";

import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import { UserService } from "../user/user.service";
import { User } from "../user/entities/user.entity";

import { AuthDto } from "./dto/auth.dto";

import { appConfig } from "@/src/config";

@Injectable()
export class AuthService {

    constructor(
        private userService: UserService,

        private jwt: JwtService,
    ) {}

    async signIn(dto: AuthDto) {

        const user = await this.checkUserByEmail(
            dto.email
        );

        await this.validateUser(
            user,
            dto.password
        );

        if (user.account_status === "banned") {

            throw new UnauthorizedException(
                "Your account has been banned"
            );

        }

        if (user.account_status !== "active") {

            throw new UnauthorizedException(
                "Your account is not active"
            );

        }

        const tokens = await this.signTokens(user);

        await this.userService.setCurrentRefreshToken(user.id, tokens.refresh_token);

        return {

            message: "Login successful",

            user: {

                id: user.id,

                name: user.name,

                email: user.email,

                phone: user.phone,

                role: user.role,

                account_status: user.account_status,

            },

            ...tokens,

        };

    }

    async checkUserByEmail(
        email: string
    ): Promise<User> {

        const user =
            await this.userService.findOneByEmailForAuth(email);

        if (!user) {

            throw new UnauthorizedException(
                "Invalid email or password"
            );

        }

        return user;

    }

    async validateUser(
        user: User,
        password: string
    ): Promise<boolean> {

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {

            throw new UnauthorizedException(
                "Invalid email or password"
            );

        }

        return true;

    }

    async signTokens(user: User) {

        const accessPayload = {

            user_id: user.id,

            name: user.name,

            email: user.email,

            role: user.role,

        };

        const refreshPayload = {

            user_id: user.id,

        };

        const access_token = await this.jwt.signAsync(
            accessPayload,
            {

                secret: appConfig.env.JWT_BEARER_SECRET,

                expiresIn: "15m",

            }
        );

        const refresh_token = await this.jwt.signAsync(
            refreshPayload,
            {

                secret: appConfig.env.JWT_REFRESH_SECRET,

                expiresIn: "7d",

            }
        );

        return {

            access_token,

            refresh_token,

            expires_in: 900,

            token_type: "Bearer",

        };

    }

    async refreshToken(refreshToken: string) {

        if (!refreshToken) {

            throw new UnauthorizedException(
                "Refresh token is required"
            );

        }

        try {

            const payload = await this.jwt.verifyAsync<{
                user_id: string;
            }>(
                refreshToken,
                {
                    secret: appConfig.env.JWT_REFRESH_SECRET,
                }
            );

            const user = await this.userService.getUserIfRefreshTokenMatches(
                payload.user_id,
                refreshToken
            );

            if (!user) {

                throw new UnauthorizedException(
                    "Invalid, expired, or revoked refresh token"
                );

            }

            if (user.account_status === "banned") {

                throw new UnauthorizedException(
                    "Your account has been banned"
                );

            }

            if (user.account_status !== "active") {

                throw new UnauthorizedException(
                    "Your account is not active"
                );

            }

            const tokens = await this.signTokens(user);

            await this.userService.setCurrentRefreshToken(user.id, tokens.refresh_token);

            return {

                message: "Tokens refreshed successfully",

                user: {

                    id: user.id,

                    name: user.name,

                    email: user.email,

                    phone: user.phone,

                    role: user.role,

                    account_status: user.account_status,

                },

                ...tokens,

            };

        } catch (error) {

            if (error instanceof UnauthorizedException) {
                throw error;
            }

            throw new UnauthorizedException(
                "Invalid, expired, or revoked refresh token"
            );

        }

    }

    async logout(userId?: string, refreshToken?: string) {

        if (userId) {

            await this.userService.removeRefreshToken(userId);

        } else if (refreshToken) {

            try {

                const payload = await this.jwt.verifyAsync<{ user_id: string }>(
                    refreshToken,
                    {
                        secret: appConfig.env.JWT_REFRESH_SECRET,
                    }
                );

                if (payload?.user_id) {

                    await this.userService.removeRefreshToken(payload.user_id);

                }

            } catch {

            }

        }

        return {

            message: "Logout successful",

        };

    }

}
