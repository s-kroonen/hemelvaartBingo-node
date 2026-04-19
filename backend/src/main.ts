import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from './config';
import { ValidationPipe } from '@nestjs/common';
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

  app.setGlobalPrefix(config.prefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalGuards(app.get(FirebaseAuthGuard), app.get(RolesGuard));
  app.enableCors({
    origin: [config.frontendUrl],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
