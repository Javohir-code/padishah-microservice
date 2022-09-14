import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ExceptionFilter } from 'src/filters/bad-request-exception.filter';
import { PrismaService } from 'src/user/services/prisma.service';
import configuration from '../global/config/config';
import { AddressController } from './controllers/address.controller';
import { UserController } from './controllers/user.controller';
import { AddressService } from './services/address.service';
import { SecurityService } from './services/security.service';
import { UserService } from './services/user.service';
import { AtStrategy, RtStrategy } from './strategies';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration] }),
    JwtModule.register({}),
  ],
  controllers: [UserController, AddressController],
  providers: [
    UserService,
    PrismaService,
    SecurityService,
    AtStrategy,
    RtStrategy,
    AddressService,
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter,
    },
  ],
  exports: [UserService, PrismaService, SecurityService],
})
export class UserModule {}
