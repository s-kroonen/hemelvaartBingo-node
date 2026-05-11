import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from './config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { FirebaseAuthGuard } from './auth/firebase-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { LoggingInterceptor } from './httpLogger';
import { AllExceptionsFilter } from './exceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: config.isProd
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.setGlobalPrefix(config.prefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalGuards(app.get(FirebaseAuthGuard), app.get(RolesGuard));
  // app.enableCors({
  //   origin: [config.frontendUrl,config.webappUrl],
  //   credentials: true,
  // });
  app.enableCors({
    origin: (origin, callback) => {
      // Allow local development (any port) and your production domain
      const isLocal = !origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
      const isProd = origin === config.frontendUrl || origin === config.webappUrl;

      if (isLocal || isProd) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000,'0.0.0.0');
}

bootstrap();
