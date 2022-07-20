import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/user/services/prisma.service';
import configuration from '../global/config/config';
import { UserController } from './controllers/user.controller';
import { MerchantService } from './services/merchant.service';
import { SecurityService } from './services/security.service';
import { UserService } from './services/user.service';
import { AtStrategy, RtStrategy } from './strategies';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration] }),
    JwtModule.register({}),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    MerchantService,
    PrismaService,
    SecurityService,
    AtStrategy,
    RtStrategy,
  ],
  exports: [UserService, PrismaService, SecurityService, MerchantService],
})
export class UserModule {}
