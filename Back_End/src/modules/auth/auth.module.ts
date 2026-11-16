import { Global, Module } from "@nestjs/common";

import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";

import { UserModule } from "../user/user.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

import { JwtStrategy } from "./strategies/jwt.strategy";

import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";

import { appConfig } from "@/src/config";

@Global()
@Module({

    imports: [

        UserModule,

        PassportModule.register({

            defaultStrategy: "jwt",

        }),

        JwtModule.register({

            secret: appConfig.env.JWT_BEARER_SECRET,

            signOptions: {

                expiresIn: "15m",

            },

        }),

    ],

    controllers: [

        AuthController,

    ],

    providers: [

        AuthService,

        JwtStrategy,

        JwtAuthGuard,

        RolesGuard,

    ],

    exports: [

        PassportModule,

        JwtModule,

        JwtAuthGuard,

        RolesGuard,

        AuthService,

    ],

})
export class AuthModule {}