import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PrismaService } from './user/services/prisma.service';
import { join } from 'path';

async function bootstrap() {
  const reqPath = join(__dirname, '../../');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: 'localhost:84',
        package: 'user',
        protoPath: join(reqPath, 'proto/user.proto'),
      },
    },
  );
  app.useGlobalPipes(new ValidationPipe());
  const prismaService = app.get(PrismaService);
  await app.listen();
  await prismaService.enableShutdownHooks(app);
}
bootstrap();
