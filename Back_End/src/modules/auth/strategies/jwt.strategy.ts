import {
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";

import { appConfig } from "@/src/config";
import { UserService } from "../../user/user.service";
import { AUTH_COOKIE_NAMES } from "../auth-cookies";

const cookieExtractor = (req: Request): string | null => {
    if (!req) {
        return null;
    }

    if (req.cookies) {
        if (req.cookies[AUTH_COOKIE_NAMES.ACCESS_TOKEN]) {
            return req.cookies[AUTH_COOKIE_NAMES.ACCESS_TOKEN];
        }
        if (req.cookies.accessToken) {
            return req.cookies.accessToken;
        }
    }

    if (req.signedCookies) {
        if (req.signedCookies[AUTH_COOKIE_NAMES.ACCESS_TOKEN]) {
            return req.signedCookies[AUTH_COOKIE_NAMES.ACCESS_TOKEN];
        }
        if (req.signedCookies.accessToken) {
            return req.signedCookies.accessToken;
        }
    }

    return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(
    Strategy,
    "jwt"
) {

    constructor(
        private userService: UserService
    ) {

        super({

            jwtFromRequest: ExtractJwt.fromExtractors([
                cookieExtractor,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),

            ignoreExpiration: false,

            secretOrKey:
                appConfig.env.JWT_BEARER_SECRET,

        });

    }

    async validate(payload: any) {

        if (!payload || !payload.user_id) {

            throw new UnauthorizedException(
                "Invalid token payload"
            );

        }

        let user;

        try {

            user = await this.userService.getUser(
                payload.user_id
            );

        } catch {

            throw new UnauthorizedException(
                "User not found or invalid token"
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

        return {

            id: user.id,

            user_id: user.id,

            name: user.name,

            email: user.email,

            role: user.role,

            roles: [user.role],

        };

    }

}
