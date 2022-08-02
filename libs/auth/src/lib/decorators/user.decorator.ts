import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: any, context: ExecutionContext): ParameterDecorator => {
    const req = context.switchToHttp().getRequest();
    delete req.user.password;
    return req.user;
  }
);
