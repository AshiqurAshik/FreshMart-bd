import { InMemoryCacheService } from "./in-memory-cache.service";
import { Global, Module } from "@nestjs/common";

@Global()
@Module({
  providers: [InMemoryCacheService],
  exports: [InMemoryCacheService],
})
export class InMemoryCacheModule {}
