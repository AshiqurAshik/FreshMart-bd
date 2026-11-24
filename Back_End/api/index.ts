import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "../src/app.module";
import { setupApp } from "../src/main";

let cachedServer: any;

async function bootstrapServer(): Promise<any> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  setupApp(app);
  await app.init();
  return app.getHttpAdapter().getInstance();
}

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }

  if (req.headers && req.headers["x-matched-path"]) {
    req.url = req.headers["x-matched-path"];
  }

  return cachedServer(req, res);
}
