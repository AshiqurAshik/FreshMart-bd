import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Post,
    Param,
    Patch,
    Delete,
    Query,
    Req,
    ValidationPipe,
    UseGuards
} from "@nestjs/common";

import { UserService } from "./user.service";
import { CreateUserDto, CreateAdminDto, UpdateUserDto, ChangeRoleDto, ChangeStatusDto } from "./dto/user.dto";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("users")
export class UserController {

    constructor(
        private userService: UserService
    ) { }

    // GET ALL USERS (SUPER ADMIN ONLY)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("super_admin")
    @Get()
    getUsers(@Query("include_addresses") includeAddresses?: string) {
        const shouldInclude = includeAddresses === "true" || includeAddresses === "1";
        return this.userService.getUsers(shouldInclude);
    }

    // GET OWN PROFILE (ANY AUTHENTICATED USER)
    @UseGuards(JwtAuthGuard)
    @Get("me")
    getMyProfile(@Req() req: any, @Query("include_addresses") includeAddresses?: string) {
        const shouldInclude = includeAddresses === "true" || includeAddresses === "1";
        return this.userService.getUser(req.user.user_id, shouldInclude);
    }

    // CREATE USER (PUBLIC REGISTRATION - FORCES CUSTOMER ROLE)
    @Post()
    createUser(@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) data: CreateUserDto) {
        return this.userService.createUser(data);
    }

    // CREATE ADMIN ACCOUNT (SUPER ADMIN ONLY)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("super_admin")
    @Post("admin")
    createAdminUser(@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) data: CreateAdminDto) {
        return this.userService.createAdminUser(data);
    }

    // GET SINGLE USER (SUPER ADMIN OR CUSTOMER VIEWING OWN PROFILE; ADMIN IS FORBIDDEN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("customer", "super_admin")
    @Get(":id")
    getUser(
        @Req() req: any,
        @Param("id") id: string,
        @Query("include_addresses") includeAddresses?: string
    ) {
        // Enforce customer ownership check
        if (req.user.role === "customer" && req.user.user_id !== id) {
            throw new ForbiddenException("You do not have permission to view another user's profile");
        }

        const shouldInclude = includeAddresses === "true" || includeAddresses === "1";
        return this.userService.getUser(id, shouldInclude);
    }

    // UPDATE USER 
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("customer", "super_admin")
    @Patch(":id")
    updateUser(
        @Req() req: any,
        @Param("id") id: string,
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) data: UpdateUserDto
    ) {
        // Enforce customer ownership check
        if (req.user.role === "customer" && req.user.user_id !== id) {
            throw new ForbiddenException("You can only update your own profile");
        }

        return this.userService.updateUser(id, data);
    }

    // CHANGE USER ROLE (SUPER ADMIN ONLY; PREVENTS DEMOTING LAST SUPER ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("super_admin")
    @Patch(":id/role")
    changeRole(
        @Param("id") id: string,
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) dto: ChangeRoleDto
    ) {
        return this.userService.changeRole(id, dto);
    }

    // CHANGE ACCOUNT STATUS (SUPER ADMIN ONLY; PREVENTS DISABLING LAST SUPER ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("super_admin")
    @Patch(":id/status")
    changeStatus(
        @Param("id") id: string,
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) dto: ChangeStatusDto
    ) {
        return this.userService.changeStatus(id, dto);
    }

    // DELETE USER (SUPER ADMIN ONLY; PREVENTS DELETING LAST SUPER ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("super_admin")
    @Delete(":id")
    deleteUser(@Param("id") id: string) {
        return this.userService.deleteUser(id);
    }
}
