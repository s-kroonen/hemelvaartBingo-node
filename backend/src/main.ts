import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from "./config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(config.prefix);

  app.enableCors({
    origin: [config.frontendUrl],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
