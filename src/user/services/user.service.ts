import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/user/services/prisma.service';
import { UserDetailsDto } from '../dto/user.details.dto';
import { IRequestUser } from '../interfaces/request-user.interface';
import { User } from '@prisma/client';
import fetch from 'cross-fetch';
import { v4 as uuidv4 } from 'uuid';
import { AddressDto } from '../dto/address.details.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async addUserDetails(
    IUser: IRequestUser,
    userDetailsDto: UserDetailsDto,
    addressDetailsDto: AddressDto,
  ): Promise<{ user: User; accessToken: string }> {
    const foundUser = await this.findUserByMsisdn(IUser.msisdn);
    if (foundUser) {
      const user = await this.prisma.user.update({
        where: { msisdn: foundUser.msisdn },
        data: {
          firstName: userDetailsDto?.firstName,
          lastName: userDetailsDto?.lastName,
          middleName: userDetailsDto?.middleName,
          email: userDetailsDto?.email,
          msisdn: userDetailsDto?.msisdn,
        },
      });
      // const newAddresses = await this.prisma.addresses.createMany({
      //   data: [
      //     {}
      //   ],
      // });
      const payload = { msisdn: user.msisdn };
      const accessToken = await this.jwtService.sign(payload);
      return { user: user, accessToken: accessToken };
    }
  }

  async loginUser(msisdn: string) {
    const code = this.generate4RandomDigit();
    const res = await fetch(this.configService.get('sms_service.url'), {
      method: 'POST',
      headers: {
        login: this.configService.get('sms_service.username'),
        password: this.configService.get('sms_service.password'),
        Authorization: this.configService.get('sms_service.auth'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            recipient: msisdn,
            'message-id': `pad${uuidv4().substr(0, 15)}`,
            sms: {
              originator: this.configService.get('sms_service.orginator'),
              content: {
                text: `Код подтверждения для Padishah: ${code}`,
              },
            },
          },
        ],
      }),
    });
    const loginDto = { msisdn: msisdn, code: code };
    await this.prisma.otp.create({
      data: { identifier: loginDto.msisdn, code: loginDto.code },
    });
    const foundUser = await this.findUserMsisdnWise(msisdn);
    if (foundUser == true) {
      await this.prisma.user.create({ data: { msisdn: msisdn } });
    }

    return res;
  }

  async verifyTheNumber(msisdn: string): Promise<{ accessToken: string }> {
    const loginInfo = await this.prisma.otp.findFirst({
      where: { identifier: msisdn },
    });
    if (!loginInfo) throw new BadRequestException('Invalid Code!');

    const payload = { msisdn: msisdn };
    const accessToken = await this.jwtService.sign(payload);
    const result = await this.prisma.otp.delete({
      where: { id: loginInfo.id },
    });
    console.log(result);
    if (result) {
      throw new NotFoundException(`msisdn with "${loginInfo.id}" not found!`);
    }
    return { accessToken };
  }

  async findUserByMsisdn(msisdn: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { msisdn: msisdn },
    });
    if (!user) {
      throw new NotFoundException('user not found with given phone number');
    }
    return user;
  }

  private async findUserMsisdnWise(msisdn: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { msisdn: msisdn },
    });
    if (!user) {
      return true;
    } else {
      return false;
    }
  }

  private generate4RandomDigit() {
    const val = Math.floor(1000 + Math.random() * 9000);
    return val;
  }
}
