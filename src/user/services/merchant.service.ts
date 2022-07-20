import { Injectable } from '@nestjs/common';
import { MerchantRegister } from '../dto/merchant.register.dto';
import { PrismaService } from './prisma.service';
import * as argon from 'argon2';

@Injectable()
export class MerchantService {
  constructor(private prisma: PrismaService) {}

  async registerMechant(
    merchantDetails: MerchantRegister,
  ): Promise<MerchantRegister> {
    const newMerchant = await this.prisma.user.create({
      data: {
        firstName: merchantDetails.firstName,
        lastName: merchantDetails.lastName,
        middleName: merchantDetails.middleName,
        email: merchantDetails.email,
        password: await argon.hash(merchantDetails.password),
        msisdn: merchantDetails.msisdn,
      },
    });
    return newMerchant;
  }
}
