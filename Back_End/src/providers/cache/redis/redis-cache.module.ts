import { RedisCacheService } from "./redis-cache.service";
import { Global, Module } from "@nestjs/common";

@Global()
@Module({
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
