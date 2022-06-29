import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/user/services/prisma.service';
import { UserDetailsDto } from '../dto/user.details.dto';
import { IRequestUser } from '../interfaces/request-user.interface';
import { User } from '@prisma/client';
import { addSeconds } from 'date-fns';
import * as moment from 'moment';
import * as argon from 'argon2';
import { LoginInfo } from '../dto/login-info.dto';
import { PasswordDto } from '../dto/password.details.dto';
import { OtpReason } from '../enums/otp-reason.enum';
import { SecurityService } from './security.service';
import { JwtPayload, Tokens } from '../types';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly securityService: SecurityService,
  ) {}

  async addUserDetails(
    IUser: IRequestUser,
    userDetailsDto: UserDetailsDto,
  ): Promise<{
    user: User;
    tokens: { accessToken: string; refreshToken: string };
  }> {
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
      const payload: JwtPayload = { userId: user.id, msisdn: user.msisdn };
      const tokens = await this.securityService.getTokens(payload);
      await this.securityService.updateRtHash(user.id, tokens.refresh_token);
      return {
        user: user,
        tokens: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
      };
    }
  }

  async loginUser(loginInfo: LoginInfo) {
    const { res, code } = await this.securityService.sendMessage(
      loginInfo.msisdn,
    );
    const loginDto = { msisdn: loginInfo.msisdn, code: code.toString() };
    const expiresIn = addSeconds(
      new Date(),
      this.configService.get('accessExpiresIn'),
    );
    console.log(this.configService.get('accessExpiresIn'));
    await this.prisma.verifyCodes.upsert({
      where: {
        msisdn: loginDto.msisdn,
      },
      update: {
        code: loginDto.code,
        expiredAt: expiresIn,
        updatedAt: new Date(),
        reason: loginInfo.reason ? loginInfo.reason : 'LOGIN',
      },
      create: {
        msisdn: loginDto.msisdn,
        code: loginDto.code,
        expiredAt: expiresIn,
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

  async verifyTheNumber(msisdn: string, code: string): Promise<Tokens> {
    const loginInfo = await this.prisma.verifyCodes.findFirst({
      where: { msisdn: msisdn, expiredAt: { gt: new Date() }, code: code },
    });
    if (!loginInfo) throw new BadRequestException('Invalid or Expired Code!');
    const user = await this.prisma.user.findUnique({
      where: { msisdn: loginInfo.msisdn },
    });
    if (!user) throw new NotFoundException('user credentials not found');
    const payload: JwtPayload = { userId: user.id, msisdn: user.msisdn };
    const tokens = await this.securityService.getTokens(payload);
    await this.securityService.updateRtHash(user.id, tokens.refresh_token);
    await this.prisma.verifyCodes.update({
      data: { attempts: ++loginInfo.attempts },
      where: { id: loginInfo.id },
    });
    // if (result) {
    //   throw new NotFoundException(`msisdn with "${loginInfo.id}" not found!`);
    // }
    return tokens;
  }

  async addPassword(
    IUser: IRequestUser,
    passwordDto: PasswordDto,
  ): Promise<void> {
    if (passwordDto.password === passwordDto.repassword) {
      await this.prisma.user.update({
        where: { msisdn: IUser.msisdn },
        data: {
          password: await argon.hash(passwordDto.password),
        },
      });
      return;
    }

    throw new BadRequestException('Passwords are not match!');
  }

  async getForgetPasswordOtp(msisdn: string) {
    const { res, code } = await this.securityService.sendMessage(msisdn);
    const user = await this.findUserByMsisdn(msisdn);
    if (user) {
      const expiresIn = addSeconds(
        new Date(),
        this.configService.get('accessExpiresIn'),
      );

      await this.prisma.verifyCodes.update({
        where: { msisdn: msisdn },
        data: {
          code: code.toString(),
          reason: OtpReason.FORGETPASSWORD,
          updatedAt: new Date(),
          expiredAt: expiresIn,
        },
      });
      return res;
    }
  }

  async changePassword(
    msisdn: string,
    code: string,
    passwordDto: PasswordDto,
  ): Promise<void> {
    const loginInfo = await this.prisma.verifyCodes.findFirst({
      where: {
        msisdn: msisdn,
        expiredAt: { gt: new Date() },
        reason: OtpReason.FORGETPASSWORD,
        code: code,
      },
    });

    if (!loginInfo) throw new BadRequestException('Invalid code');

    if (passwordDto.password === passwordDto.repassword) {
      await this.prisma.user.update({
        where: { msisdn: msisdn },
        data: {
          password: await argon.hash(passwordDto.password),
        },
      });
      return;
    }
    throw new BadRequestException('passwords are not match!');
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

  async logout(userId: number): Promise<boolean> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        refreshToken: {
          not: null,
        },
      },
      data: {
        refreshToken: null,
      },
    });
    return true;
  }

  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    console.log(user);

    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied!');

    const rtMatches = await argon.verify(user.refreshToken, rt);
    if (!rtMatches) throw new ForbiddenException('Access Denied!!!');
    const payload: JwtPayload = {
      userId: user.id,
      msisdn: user.msisdn,
    };
    const tokens = await this.securityService.getTokens(payload);
    await this.securityService.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
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
}
