import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { PrismaService } from './user/services/prisma.service';
import { join } from 'path';

const microserviceOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'app',
    protoPath: join(__dirname, '../src/app.proto'),
  },
};

async function bootstrap() {
  // const app = await NestFactory.createMicroservice(
  //   AppModule,
  //   microserviceOptions,
  // );
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const prismaService = app.get(PrismaService);

  // const options = {
  //   origin: '*',
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   preflightContinue: false,
  //   optionsSuccessStatus: 204,
  //   credentials: true,
  // };

  // app.enableCors(options);
  app.listen(3000);
  // await prismaService.enableShutdownHooks();
}
bootstrap();
