import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import configuration from './global/config/config';

@Module({
  imports: [ConfigModule.forRoot({ load: [configuration] }), UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
