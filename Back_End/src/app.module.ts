
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PostgresDatabaseProviderModule } from "@/providers/database/postgres/provider.module";
import { AppController } from "@/src/app.controller";
import { AppService } from "@/src/app.service";
import global_config from "@/config/global_config";
import { BullModule } from "@nestjs/bull";
import { TestModule } from "./modules/test/test.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { CartsModule } from "./modules/carts/carts.module";
import { UserModule } from "./modules/user/user.module";
import { ProductModule } from "./modules/products/products.module";
import { AddressModule } from "./modules/addresse/address.module";
import { CategoryModule } from "./modules/category/category.module";
import { AuthModule } from "./modules/auth/auth.module";

@Module({
  imports: [
    PostgresDatabaseProviderModule,

    ConfigModule.forRoot({
      isGlobal: true,
      load: [],
    }),

    BullModule.forRoot({
      url: process.env.REDIS_URL,
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [global_config],
    }),

    UserModule,
    AuthModule,
    AddressModule,
    ProductModule,
    CategoryModule,
    TestModule,
    OrdersModule,
    CartsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
