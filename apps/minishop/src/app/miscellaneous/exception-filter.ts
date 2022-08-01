import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  async catch(exception: Error, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse());
    } else {
      const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      const errorResponse = {
        statusCode,
        message: 'Internal server error',
      };
      console.error(
        `request method: ${request.method} request url${request.url}`,
        exception
      );
      response.status(statusCode).json(errorResponse);
    }
  }
}
