import {
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";

import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
    handleRequest(err: any, user: any, info: any) {
        console.log("JWT ERROR:", info?.message);
        console.log("AUTH ERROR:", err?.message);

        if (err || !user) {
            throw err || new UnauthorizedException(
                info?.message || "Unauthorized"
            );
        }

        return user;
    }
}