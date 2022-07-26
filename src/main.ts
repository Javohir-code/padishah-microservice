import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PrismaService } from './user/services/prisma.service';
import { join } from 'path';

const microserviceOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'user',
    protoPath: join(__dirname, './user/user.proto'),
  },
};

async function bootstrap() {
  const app = await NestFactory.createMicroservice(
    AppModule,
    microserviceOptions,
  );
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
  app.listen();
  // await prismaService.enableShutdownHooks(app);
}
bootstrap();
