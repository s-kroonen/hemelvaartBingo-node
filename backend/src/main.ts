import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import config from "./config";
import {ValidationPipe} from '@nestjs/common';
import {FirebaseAuthGuard} from "./auth/firebase-auth.guard";
import {RolesGuard} from "./auth/roles.guard";


async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', "log", "debug"],
    });

    app.setGlobalPrefix(config.prefix);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    app.useGlobalGuards(
        app.get(FirebaseAuthGuard),
        app.get(RolesGuard),
    );
    app.enableCors({
        origin: [config.frontendUrl],
        credentials: true,
    });
    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
