import {
    Injectable,
    BadRequestException,
    ConflictException,
    NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Order } from "../orders/entities/orders.entity";
import { CreateUserDto, CreateAdminDto, UpdateUserDto, ChangeRoleDto, ChangeStatusDto } from "./dto/user.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>
    ) {}

    // GET ALL USERS (SUPER ADMIN ONLY)
    async getUsers(includeAddresses = false) {
        return await this.userRepository.find({
            relations: includeAddresses ? ["addresses"] : [],
            order: {
                created_at: "DESC"
            },
        });
    }

    // GET SINGLE USER
    async getUser(id: string, includeAddresses = false) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: includeAddresses ? ["addresses"] : [],
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    }

    // FIND USER BY EMAIL FOR AUTHENTICATION
    async findOneByEmailForAuth(email: string): Promise<User | null> {
        return await this.userRepository
            .createQueryBuilder("user")
            .addSelect("user.password_hash")
            .where("user.email = :email", { email })
            .getOne();
    }

    // SET CURRENT REFRESH TOKEN HASH
    async setCurrentRefreshToken(userId: string, refreshToken: string): Promise<void> {
        try {
            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
            await this.userRepository.update(userId, {
                refresh_token_hash: hashedRefreshToken,
            });
        } catch {
            // Column may not be migrated yet in database
        }
    }

    // REMOVE REFRESH TOKEN (REVOKE ON LOGOUT OR STATUS CHANGE)
    async removeRefreshToken(userId: string): Promise<void> {
        try {
            await this.userRepository.update(userId, {
                refresh_token_hash: null,
            });
        } catch {
            // Column may not be migrated yet in database
        }
    }

    // GET USER IF REFRESH TOKEN MATCHES (TOKEN VERIFICATION & REVOCATION CHECK)
    async getUserIfRefreshTokenMatches(userId: string, refreshToken: string): Promise<User | null> {
        try {
            const user = await this.userRepository
                .createQueryBuilder("user")
                .addSelect("user.refresh_token_hash")
                .where("user.id = :userId", { userId })
                .getOne();

            if (!user) {
                return null;
            }

            if (user.refresh_token_hash === null) {
                return null;
            }

            if (user.refresh_token_hash) {
                const isMatching = await bcrypt.compare(
                    refreshToken,
                    user.refresh_token_hash
                );
                if (!isMatching) {
                    return null;
                }
            }

            return user;
        } catch {
            return await this.userRepository.findOneBy({ id: userId });
        }
    }

    // CREATE USER (PUBLIC REGISTRATION - FORCES ROLE CUSTOMER)
    async createUser(data: CreateUserDto) {
        const existingUser = await this.userRepository.findOneBy({
            email: data.email
        });

        if (existingUser) {
            throw new ConflictException("Email already exists");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = this.userRepository.create({
            name: data.name,
            email: data.email,
            phone: data.phone,
            password_hash: hashedPassword,
            role: "customer", // Enforce customer role on public registration
            account_status: "active"
        });

        const result = await this.userRepository.save(user);

        return {
            message: "User registered successfully",
            user: {
                id: result.id,
                name: result.name,
                email: result.email,
                phone: result.phone,
                role: result.role,
                account_status: result.account_status
            }
        };
    }

    // CREATE ADMIN (SUPER ADMIN ONLY)
    async createAdminUser(data: CreateAdminDto) {
        const existingUser = await this.userRepository.findOneBy({
            email: data.email
        });

        if (existingUser) {
            throw new ConflictException("Email already exists");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = this.userRepository.create({
            name: data.name,
            email: data.email,
            phone: data.phone,
            password_hash: hashedPassword,
            role: "admin", // Enforce admin role
            account_status: "active"
        });

        const result = await this.userRepository.save(user);

        return {
            message: "Admin created successfully",
            user: {
                id: result.id,
                name: result.name,
                email: result.email,
                phone: result.phone,
                role: result.role,
                account_status: result.account_status
            }
        };
    }

    // UPDATE PROFILE (ONLY SAFE PROFILE FIELDS ALLOWED)
    async updateUser(id: string, data: UpdateUserDto) {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            throw new NotFoundException("User not found");
        }

        if (data.email && data.email !== user.email) {
            const existingUser = await this.userRepository.findOneBy({
                email: data.email
            });

            if (existingUser) {
                throw new ConflictException("Email already exists");
            }
        }

        // Restrict to safe fields (prevent privilege escalation)
        const safeData: Partial<User> = {};
        if (data.name !== undefined) safeData.name = data.name;
        if (data.email !== undefined) safeData.email = data.email;
        if (data.phone !== undefined) safeData.phone = data.phone;

        Object.assign(user, safeData);

        const result = await this.userRepository.save(user);

        return {
            message: "User updated successfully",
            user: {
                id: result.id,
                name: result.name,
                email: result.email,
                phone: result.phone,
                role: result.role,
                account_status: result.account_status
            }
        };
    }

    // CHANGE USER ROLE (SUPER ADMIN ONLY; PREVENTS DEMOTING LAST SUPER ADMIN)
    async changeRole(id: string, dto: ChangeRoleDto) {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            throw new NotFoundException("User not found");
        }

        // If target user is super_admin and new role is different, ensure there is at least one other active super_admin
        if (user.role === "super_admin" && dto.role !== "super_admin") {
            const superAdminCount = await this.userRepository.count({
                where: { role: "super_admin", account_status: "active" }
            });

            if (superAdminCount <= 1) {
                throw new BadRequestException("Cannot demote the last active super_admin in the system");
            }
        }

        user.role = dto.role;
        const result = await this.userRepository.save(user);

        return {
            message: `User role updated to ${dto.role} successfully`,
            user: {
                id: result.id,
                name: result.name,
                email: result.email,
                phone: result.phone,
                role: result.role,
                account_status: result.account_status
            }
        };
    }

    // CHANGE ACCOUNT STATUS (SUPER ADMIN ONLY; PREVENTS DISABLING LAST SUPER ADMIN)
    async changeStatus(id: string, dto: ChangeStatusDto) {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            throw new NotFoundException("User not found");
        }

        // If target user is super_admin and status is not active, prevent deactivation of last super_admin
        if (user.role === "super_admin" && dto.account_status !== "active") {
            const superAdminCount = await this.userRepository.count({
                where: { role: "super_admin", account_status: "active" }
            });

            if (superAdminCount <= 1) {
                throw new BadRequestException("Cannot deactivate or ban the last active super_admin in the system");
            }
        }

        user.account_status = dto.account_status;
        const result = await this.userRepository.save(user);

        // Revoke refresh token if account is deactivated or banned
        if (dto.account_status !== "active") {
            await this.removeRefreshToken(id);
        }

        return {
            message: `User account status updated to ${dto.account_status} successfully`,
            user: {
                id: result.id,
                name: result.name,
                email: result.email,
                phone: result.phone,
                role: result.role,
                account_status: result.account_status
            }
        };
    }

    // DELETE USER (SUPER ADMIN ONLY; PREVENTS DELETING LAST SUPER ADMIN)
    async deleteUser(id: string) {
        const user = await this.userRepository.findOneBy({ id });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        if (user.role === "super_admin") {
            const superAdminCount = await this.userRepository.count({
                where: { role: "super_admin", account_status: "active" }
            });

            if (superAdminCount <= 1) {
                throw new BadRequestException("Cannot delete the last active super_admin in the system");
            }
        }

        const orderCount = await this.orderRepository.count({
            where: {
                user: { id }
            }
        });

        if (orderCount > 0) {
            user.account_status = "inactive";
            await this.userRepository.save(user);
            await this.removeRefreshToken(id);

            return {
                message: "User account deactivated to preserve historical orders",
                account_status: user.account_status
            };
        }

        await this.userRepository.remove(user);

        return {
            message: "User deleted successfully"
        };
    }
}
