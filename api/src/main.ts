import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import './services/database';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  const PORT = 4000;
  await app.listen(PORT);

  console.log(`App running at port ${PORT}`);
}

bootstrap();
