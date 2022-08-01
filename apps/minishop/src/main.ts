import { AllExceptionFilter } from './app/miscellaneous/exception-filter';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new AllExceptionFilter());
  const swaggerEnabled = process.env.SWAGGER_ENABLED === 'enabled';
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Minishop API')
      .setDescription('Minishop API description')
      .setVersion('1.0')
      .addTag('Minishop')
      .addBearerAuth()
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
