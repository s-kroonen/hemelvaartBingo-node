import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const ip =
      'proxyAddress: ' +
      req.headers['x-forwarded-for']?.split(',')[0] +
      'remoteAddress: ' + // real client IP behind proxy
      req.socket?.remoteAddress;

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.log(
            `${req.method} ${req.url} - ${ip} - ${Date.now() - now}ms`,
          ),
        ),
      );
  }
}
