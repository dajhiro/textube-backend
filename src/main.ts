import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import passport from 'passport';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // CORS configuration
  const corsOrigins = configService
    .get('CORS_ORIGINS', '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const isProduction = configService.get('NODE_ENV') === 'production';

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
  });

  // Session configuration
  app.use(
    session({
      secret: configService.get('SESSION_SECRET') || 'fallback-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: isProduction, // HTTPS only in production
        sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-domain cookies
        // domain: isProduction ? '.textube.io' : undefined, // Share cookies across subdomains
      },
      proxy: isProduction, // Trust proxy headers (Railway, Cloudflare)
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  // Startup logs
  console.log(`\n🚀 Application is running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
  console.log(`📡 Server listening on port ${port}`);
  console.log(`🌐 CORS enabled for origins: ${corsOrigins.join(', ')}`);
  console.log(`🍪 Cookies: secure=${isProduction}, sameSite=${isProduction ? 'none' : 'lax'}\n`);
}
bootstrap();
