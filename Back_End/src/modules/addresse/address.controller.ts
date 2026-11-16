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
    UseGuards,
    ValidationPipe
} from "@nestjs/common";

import { AddressService } from "./address.service";
import {
    CreateAddressDto,
    UpdateAddressDto
} from "./dto/address.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("addresses")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("customer", "super_admin")
export class AddressController {

    constructor(
        private addressService: AddressService
    ) {}

    // GET ADDRESSES (FOR CUSTOMER: OWN; FOR SUPER ADMIN: ALL OR FILTERED)
    @Get()
    getAddresses(@Req() req: any, @Query("include_user") includeUser?: string) {
        const shouldInclude = includeUser === "true" || includeUser === "1";
        const isSuperAdmin = req.user.role === "super_admin";
        const userId = isSuperAdmin ? undefined : req.user.user_id;

        return this.addressService.getAddresses(userId, isSuperAdmin ? shouldInclude : false);
    }

    // GET ADDRESSES BY USER (WITH OWNERSHIP CHECK)
    @Get("user/:userId")
    getUserAddresses(@Req() req: any, @Param("userId") userId: string) {
        if (req.user.role === "customer" && req.user.user_id !== userId) {
            throw new ForbiddenException("You cannot view another customer's addresses");
        }

        return this.addressService.getUserAddresses(userId);
    }

    // GET SINGLE ADDRESS (WITH OWNERSHIP CHECK)
    @Get(":id")
    getAddress(
        @Req() req: any,
        @Param("id") id: string,
        @Query("include_user") includeUser?: string
    ) {
        const shouldInclude = includeUser === "true" || includeUser === "1";
        const isSuperAdmin = req.user.role === "super_admin";

        return this.addressService.getAddress(
            id,
            req.user.user_id,
            isSuperAdmin,
            isSuperAdmin ? shouldInclude : false
        );
    }

    // CREATE ADDRESS (FORCES AUTHENTICATED USER IDENTITY)
    @Post()
    createAddress(
        @Req() req: any,
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false })) data: CreateAddressDto
    ) {
        const userId = req.user.user_id;
        return this.addressService.createAddress(userId, data);
    }

    // UPDATE ADDRESS (WITH OWNERSHIP CHECK)
    @Patch(":id")
    updateAddress(
        @Req() req: any,
        @Param("id") id: string,
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) data: UpdateAddressDto
    ) {
        const isSuperAdmin = req.user.role === "super_admin";
        return this.addressService.updateAddress(id, data, req.user.user_id, isSuperAdmin);
    }

    // DELETE ADDRESS (WITH OWNERSHIP CHECK)
    @Delete(":id")
    deleteAddress(
        @Req() req: any,
        @Param("id") id: string
    ) {
        const isSuperAdmin = req.user.role === "super_admin";
        return this.addressService.deleteAddress(id, req.user.user_id, isSuperAdmin);
    }
}
