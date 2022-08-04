/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as passport from 'passport';
import * as session from 'express-session';
import { AllExceptionFilter } from './app/miscellaneous/exception-filter';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import  { PrismaClient } from '@prisma/client';
import { v4 as randomString } from 'uuid';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new AllExceptionFilter());
  // app.use(
  //   session({
  //     cookie: {
  //       httpOnly: true,
  //       maxAge: 30 * 24 * 60 * 60 * 1000,
  //     },
  //     secret: 'secret',
  //     resave: false,
  //     saveUninitialized: false,
  //     genid: (req) => `${req.user ? req.user.id : 0}-${randomString()}`,
  //     store: new PrismaSessionStore(
  //       new PrismaClient(),
  //       {
  //         checkPeriod: 30 * 60 * 1000,
  //         dbRecordIdIsSessionId: true
  //       }
  //     )
  //   })
  // );
  // app.use(passport.initialize());
  // app.use(passport.session());
  const swaggerEnabled = process.env.SWAGGER_ENABLED === 'enabled';
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Minishop API')
      .setDescription('Minishop API description')
      .setVersion('1.0')
      .addTag('Minishop')
      .addCookieAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(globalPrefix, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }
  const port = process.env.PORT || 3333;
  app.listen(port, () => {
    Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix);
  });
}

bootstrap();
