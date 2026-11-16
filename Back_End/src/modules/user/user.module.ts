import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "./entities/user.entity";
import { Order } from "../orders/entities/orders.entity";

import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({

    imports: [
        TypeOrmModule.forFeature([User, Order])
    ],

    controllers: [
        UserController
    ],

    providers: [
        UserService
    ],

    exports: [
        UserService
    ]

})
export class UserModule {}