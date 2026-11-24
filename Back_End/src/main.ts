import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { join } from "path";
import { existsSync } from "fs";

dotenv.config();

export function setupApp(app: NestExpressApplication) {
  const uploadsDir = join(process.cwd(), "uploads");
  if (existsSync(uploadsDir)) {
    app.useStaticAssets(uploadsDir, {
      prefix: "/uploads/",
    });
  }

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set("trust proxy", true);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://cdnjs.cloudflare.com",
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://cdnjs.cloudflare.com",
            "https://fonts.googleapis.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "validator.swagger.io", "https:"],
          connectSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 1. Logger
  app.use((req: Request, res: Response, next: NextFunction) => {
    const now = new Date().toISOString().replace("T", " ").replace(/\..+/, "");
    console.log(`[HTTP] [${now}] ${req.method} ${req.originalUrl}`);
    next();
  });

  // 2. Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle("KDex API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    customCssUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css",
    customJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js",
    ],
  });

  // 3. Cookie Parser
  const cookieSecret =
    process.env.COOKIE_SECRET || "freshmart_cookie_secret_key_2026";
  app.use(cookieParser(cookieSecret));

  // 4. CORS Configuration
  const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:3000",
    ...(process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
      : []),
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
      "x-csrf-token",
    ],
    maxAge: 86400,
  });
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  setupApp(app);
  const port = parseInt(process.env.PORT || "5001", 10);
  await app.listen(port);
  console.log(`FreshMartBD backend is running on http://localhost:${port}`);
}

// Only launch traditional HTTP listener when executed directly and not in Vercel serverless environment
if (require.main === module && !process.env.VERCEL) {
  bootstrap();
}
