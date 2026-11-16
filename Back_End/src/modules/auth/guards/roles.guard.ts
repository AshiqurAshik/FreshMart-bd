import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from "@nestjs/common";

import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(
        private reflector: Reflector
    ) {}

    canActivate(
        context: ExecutionContext
    ): boolean {

        const requiredRoles =
            this.reflector.getAllAndOverride<string[]>(
                ROLES_KEY,
                [
                    context.getHandler(),
                    context.getClass(),
                ]
            );

        // Default-deny approach: if RolesGuard is applied to a route, explicit roles are required
        if (!requiredRoles || requiredRoles.length === 0) {
            throw new ForbiddenException("Access denied: No role permitted for this resource");
        }

        const request = context.switchToHttp().getRequest();

        const user = request.user;

        if (!user || !user.role) {
            throw new ForbiddenException("User not authenticated or missing role");
        }

        if (user.role === "super_admin") {
            return true;
        }

        const userRoles: string[] = Array.isArray(user.roles)
            ? user.roles
            : [user.role];

        const hasRole = requiredRoles.some((role) => userRoles.includes(role));

        if (!hasRole) {
            throw new ForbiddenException("You do not have permission to access this resource");
        }

        return true;
    }

}
