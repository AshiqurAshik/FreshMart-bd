import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Address } from "./entities/address.entity";
import { User } from "../user/entities/user.entity";

import {
    CreateAddressDto,
    UpdateAddressDto
} from "./dto/address.dto";

@Injectable()
export class AddressService {

    constructor(
        @InjectRepository(Address)
        private addressRepository: Repository<Address>,

        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {}

    // GET ADDRESSES (FOR CUSTOMER: OWN ADDRESSES; FOR SUPER ADMIN: ALL OR USER SPECIFIC)
    async getAddresses(userId?: string, includeUser = false) {
        if (userId) {
            return await this.addressRepository.find({
                where: { user_id: userId },
                relations: includeUser ? ["user"] : [],
                order: { is_default: "DESC", created_at: "DESC" },
            });
        }

        return await this.addressRepository.find({
            relations: includeUser ? ["user"] : [],
            order: { created_at: "DESC" },
        });
    }

    // GET ADDRESSES BY USER
    async getUserAddresses(user_id: string) {
        const user = await this.userRepository.findOneBy({
            id: user_id
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return await this.addressRepository.find({
            where: { user_id },
            order: { is_default: "DESC", created_at: "DESC" },
        });
    }

    // GET SINGLE ADDRESS WITH OWNERSHIP CHECK
    async getAddress(id: string, userId?: string, isSuperAdmin = false, includeUser = false) {
        const address = await this.addressRepository.findOne({
            where: { id },
            relations: includeUser ? ["user"] : [],
        });

        if (!address) {
            throw new NotFoundException("Address not found");
        }

        if (!isSuperAdmin && userId && address.user_id !== userId) {
            throw new ForbiddenException("You do not have permission to view this address");
        }

        return address;
    }

    // CREATE ADDRESS (FORCES AUTHENTICATED USER ID)
    async createAddress(userId: string, data: CreateAddressDto) {
        const user = await this.userRepository.findOneBy({
            id: userId
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        if (data.is_default === true) {
            await this.addressRepository.update(
                { user_id: userId, is_default: true },
                { is_default: false }
            );
        }

        const address = this.addressRepository.create({
            ...data,
            user_id: userId,
            is_default: data.is_default ?? false
        });

        const result = await this.addressRepository.save(address);

        return {
            message: "Address created successfully",
            address: result
        };
    }

    // UPDATE ADDRESS WITH OWNERSHIP CHECK
    async updateAddress(id: string, data: UpdateAddressDto, userId?: string, isSuperAdmin = false) {
        const address = await this.addressRepository.findOneBy({ id });

        if (!address) {
            throw new NotFoundException("Address not found");
        }

        if (!isSuperAdmin && userId && address.user_id !== userId) {
            throw new ForbiddenException("You do not have permission to update this address");
        }

        // Prevent tampering with user_id
        const { user_id, ...updateData } = data as any;

        if (updateData.is_default === true) {
            await this.addressRepository.update(
                {
                    user_id: address.user_id,
                    is_default: true
                },
                {
                    is_default: false
                }
            );
        }

        Object.assign(address, updateData);

        const result = await this.addressRepository.save(address);

        return {
            message: "Address updated successfully",
            address: result
        };
    }

    // DELETE ADDRESS WITH OWNERSHIP CHECK
    async deleteAddress(id: string, userId?: string, isSuperAdmin = false) {
        const address = await this.addressRepository.findOneBy({ id });

        if (!address) {
            throw new NotFoundException("Address not found");
        }

        if (!isSuperAdmin && userId && address.user_id !== userId) {
            throw new ForbiddenException("You do not have permission to delete this address");
        }

        await this.addressRepository.remove(address);

        return {
            message: "Address deleted successfully"
        };
    }
}
