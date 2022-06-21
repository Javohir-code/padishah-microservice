import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './user/services/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prismaService = app.get(PrismaService);

  const options = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };

  app.enableCors(options);

  await prismaService.enableShutdownHooks(app);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
