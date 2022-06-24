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
import { addSeconds } from 'date-fns';
import * as moment from 'moment';
import { AddressDto } from '../dto/address.details.dto';
import { LoginInfo } from '../dto/login-info.dto';
import { RegionDto } from '../dto/region.details.dto';
import { DistrictDto } from '../dto/district.details.dto';
import { PasswordDto } from '../dto/password.details.dto';

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
  ): Promise<{ user: User; accessToken: string }> {
    const foundUser = await this.findUserByMsisdn(IUser.msisdn);
    if (foundUser) {
      const updatedAt = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
      const user = await this.prisma.user.update({
        where: { msisdn: foundUser.msisdn },
        data: {
          firstName: userDetailsDto?.firstName,
          lastName: userDetailsDto?.lastName,
          middleName: userDetailsDto?.middleName,
          email: userDetailsDto?.email,
          status: userDetailsDto?.status,
          updatedAt: updatedAt,
        },
      });
      const payload = { msisdn: user.msisdn };
      const accessToken = await this.jwtService.sign(payload);
      return { user: user, accessToken: accessToken };
    }
  }

  // async addUserAddress(IUser: IRequestUser, addressDetails: AddressDto) {
  //   const user = await this.findUserByMsisdn(IUser.msisdn);
  //   const newAddress = await this.prisma.userAddresses.create({
  //     data: {
  //       userId: user.id,
  //       regionId: 1,
  //       districtId: 1,
  //       latitude: addressDetails?.latitude,
  //       longitude: addressDetails?.longitude,
  //       name: addressDetails?.name,
  //       street: addressDetails?.street,
  //       city: addressDetails?.city,
  //       home: addressDetails?.home,
  //       apartment: addressDetails?.apartment,
  //       comment: addressDetails?.comment,
  //       domofon: addressDetails?.domofon,
  //       address: addressDetails?.address,
  //     },
  //   });
  // }

  async loginUser(loginInfo: LoginInfo) {
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
            recipient: loginInfo.msisdn,
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
    const loginDto = { msisdn: loginInfo.msisdn, code: code.toString() };
    const expiresIn = addSeconds(
      new Date(),
      this.configService.get('expiresIn'),
    );
    await this.prisma.verifyCodes.upsert({
      where: {
        msisdn: loginDto.msisdn,
      },
      update: { code: loginDto.code, expiredAt: expiresIn },
      create: {
        msisdn: loginDto.msisdn,
        code: loginDto.code,
        ip: loginInfo.ipAddress,
      },
    });
    const foundUser = await this.findUserMsisdnWise(loginInfo.msisdn);
    if (foundUser == true) {
      await this.prisma.user.create({
        data: {
          msisdn: loginInfo.msisdn,
        },
      });
    }

    return res;
  }

  async verifyTheNumber(msisdn: string): Promise<{ accessToken: string }> {
    const loginInfo = await this.prisma.verifyCodes.findFirst({
      where: { msisdn: msisdn, expiredAt: { gt: new Date() } },
    });
    if (!loginInfo) throw new BadRequestException('Invalid or Expired Code!');

    const payload = { msisdn: msisdn };
    const accessToken = await this.jwtService.sign(payload);
    const result = await this.prisma.verifyCodes.update({
      data: { attempts: ++loginInfo.attempts },
      where: { id: loginInfo.id },
    });
    console.log(result);
    if (result) {
      throw new NotFoundException(`msisdn with "${loginInfo.id}" not found!`);
    }
    return { accessToken };
  }

  async addPassword(
    IUser: IRequestUser,
    passwordDto: PasswordDto,
  ): Promise<void> {
    if (passwordDto.password === passwordDto.repassword) {
      await this.prisma.user.update({
        where: { msisdn: IUser.msisdn },
        data: {
          password: passwordDto.password,
        },
      });
    }

    throw new BadRequestException('Passwords are not match!');
  }

  // async forgetPassword(msisdn: string) {}

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
