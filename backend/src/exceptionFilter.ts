import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : 500;

    let errorResponse = '';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      errorResponse =
        typeof res === 'string' ? res : JSON.stringify(res);
    }

    this.logger.error(
      `${req.method} ${req.url} ${status} - ${errorResponse}`,
      exception instanceof Error ? exception.stack : '',
    );

    throw exception;
  }
}