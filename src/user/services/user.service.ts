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
import { RolesEnum, User } from '@prisma/client';
import { addSeconds } from 'date-fns';
import * as argon from 'argon2';
import { RpcException } from '@nestjs/microservices';
import * as grpc from '@grpc/grpc-js';
import { LoginInfo } from '../dto/login-info.dto';
import { PasswordDto } from '../dto/password.details.dto';
import { OtpReason } from '../enums/otp-reason.enum';
import { SecurityService } from './security.service';
import { JwtPayload } from '../types';

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
      const user = await this.prisma.user.update({
        where: { msisdn: foundUser.msisdn },
        data: {
          firstName: userDetailsDto?.firstName,
          lastName: userDetailsDto?.lastName,
          middleName: userDetailsDto?.middleName,
          email: userDetailsDto?.email,
          status: userDetailsDto?.status,
        },
        include: {
          role: {
            select: {
              role: {
                select: { name: true },
              },
            },
          },
        },
      });
      delete user.password;
      delete user.refreshToken;
      const payload: JwtPayload = {
        userId: user.id,
        msisdn: user.msisdn,
        role: user.role[0].role?.name,
      };
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

  async login(loginInfo: LoginInfo) {
    const { res, code } = await this.securityService
      .sendMessage(loginInfo.msisdn)
      .catch((error) => {
        throw new RpcException(error.message);
      });
    const loginDto = { msisdn: loginInfo.msisdn, code: code.toString() };
    const expiresIn = addSeconds(
      new Date(),
      this.configService.get('accessExpiresIn'),
    );

    await this.prisma.verifyCodes
      .upsert({
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
      })
      .catch((error) => {
        throw new RpcException({
          code: grpc.status.NOT_FOUND,
          message: error.message,
        });
      });
    const foundUser = await this.findUserMsisdnWise(loginInfo.msisdn);
    if (foundUser == true) {
      const role = await this.prisma.roles
        .findFirst({
          where: { name: 'CLIENT' },
        })
        .catch((error) => {
          throw new RpcException({
            code: grpc.status.NOT_FOUND,
            message: error.message,
          });
        });
      const newUser = await this.prisma.user
        .create({
          data: {
            msisdn: loginInfo.msisdn,
          },
        })
        .catch((error) => {
          throw new RpcException({
            code: grpc.status.NOT_FOUND,
            message: error.message,
          });
        });
      await this.prisma.roleUsers
        .create({
          data: {
            userId: newUser.id,
            roleId: role.id,
          },
        })
        .catch((error) => {
          throw new RpcException({
            code: grpc.status.NOT_FOUND,
            message: error.message,
          });
        });
    }
  }

  async verifyTheNumber(msisdn: string, code: string): Promise<any> {
    const loginInfo = await this.prisma.verifyCodes
      .findFirst({
        where: { msisdn: msisdn, expiredAt: { gt: new Date() }, code: code },
      })
      .catch((error) => {
        throw new RpcException({
          code: grpc.status.INVALID_ARGUMENT,
          message: error.message,
        });
      });
    if (!loginInfo) throw new RpcException('Invalid or Expired Code!');
    const user = await this.prisma.user
      .findUnique({
        where: { msisdn: loginInfo.msisdn },
        include: {
          role: {
            select: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })
      .catch((error) => {
        throw new RpcException({
          code: grpc.status.NOT_FOUND,
          message: error.message,
        });
      });
    if (!user) throw new NotFoundException('user credentials not found');
    const payload: JwtPayload = {
      userId: user.id,
      msisdn: user.msisdn,
      role: user.role[0]?.role?.name,
    };
    const tokens = await this.securityService.getTokens(payload);
    await this.securityService.updateRtHash(user.id, tokens.refresh_token);
    await this.prisma.verifyCodes.update({
      data: { attempts: ++loginInfo.attempts },
      where: { id: loginInfo.id },
    });
    const token = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };
    return { tokens: token };
  }

  async addPassword(
    IUser: IRequestUser,
    passwordDto: PasswordDto,
  ): Promise<void> {
    if (passwordDto.password === passwordDto.repassword) {
      await this.prisma.user
        .update({
          where: { msisdn: IUser.msisdn },
          data: {
            password: await argon.hash(passwordDto.password),
          },
        })
        .catch((error) => {
          throw new RpcException({
            code: grpc.status.NOT_FOUND,
            message: error.message,
          });
        });
      return;
    }

    throw new RpcException('Passwords are not match!');
  }

  async getForgetPasswordOtp(msisdn: string) {
    const { res, code } = await this.securityService
      .sendMessage(msisdn)
      .catch((error) => {
        throw new RpcException(error.message);
      });
    const user = await this.findUserByMsisdn(msisdn).catch((error) => {
      throw new RpcException(error.message);
    });
    if (user) {
      const expiresIn = addSeconds(
        new Date(),
        this.configService.get('accessExpiresIn'),
      );

      await this.prisma.verifyCodes
        .update({
          where: { msisdn: msisdn },
          data: {
            code: code.toString(),
            reason: OtpReason.FORGETPASSWORD,
            updatedAt: new Date(),
            expiredAt: expiresIn,
          },
        })
        .catch((error) => {
          throw new RpcException(error.message);
        });
    }
  }

  async changePassword(
    msisdn: string,
    code: string,
    passwordDto: PasswordDto,
  ): Promise<void> {
    const loginInfo = await this.prisma.verifyCodes
      .findFirst({
        where: {
          msisdn: msisdn,
          expiredAt: { gt: new Date() },
          reason: OtpReason.FORGETPASSWORD,
          code: code,
        },
      })
      .catch((error) => {
        throw new RpcException(error.message);
      });

    if (!loginInfo) throw new RpcException('Invalid code');

    if (passwordDto.password === passwordDto.repassword) {
      await this.prisma.user
        .update({
          where: { msisdn: msisdn },
          data: {
            password: await argon.hash(passwordDto.password),
          },
        })
        .catch((error) => {
          throw new RpcException(error.message);
        });
      return;
    }
    throw new RpcException('passwords are not match!');
  }

  async findUserByMsisdn(msisdn: string): Promise<User> {
    const user = await this.prisma.user
      .findUnique({
        where: { msisdn: msisdn },
      })
      .catch((error) => {
        throw new RpcException(error.message);
      });
    if (!user) {
      throw new NotFoundException('user not found with given phone number');
    }
    return user;
  }

  private async findUserMsisdnWise(msisdn: string): Promise<boolean> {
    const user = await this.prisma.user
      .findUnique({
        where: { msisdn: msisdn },
      })
      .catch((error) => {
        throw new RpcException(error.message);
      });
    if (!user) {
      return true;
    } else {
      return false;
    }
  }

  async logout(userId: number): Promise<any> {
    await this.prisma.user
      .updateMany({
        where: {
          id: userId,
          refreshToken: {
            not: null,
          },
        },
        data: {
          refreshToken: null,
        },
      })
      .catch((error) => {
        throw new RpcException(error.message);
      });
    return { logout: 'success' };
  }

  async refreshTokens(userId: number, rt: string): Promise<any> {
    const user = await this.prisma.user
      .findUnique({
        where: { id: userId },
        include: {
          role: {
            select: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })
      .catch((error) => {
        throw new RpcException(error.message);
      });
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied!');

    const rtMatches = await argon
      .verify(user.refreshToken, rt)
      .catch((error) => {
        throw new RpcException(error.message);
      });
    if (!rtMatches) throw new ForbiddenException('Access Denied!!!');
    const payload: JwtPayload = {
      userId: user.id,
      msisdn: user.msisdn,
      role: user.role[0].role?.name,
    };
    const tokens = await this.securityService
      .getTokens(payload)
      .catch((error) => {
        throw new RpcException(error.message);
      });
    await this.securityService
      .updateRtHash(user.id, tokens.refresh_token)
      .catch((error) => {
        throw new RpcException(error.message);
      });
    const token = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };
    return { tokens: token };
  }

  async getUserById(userId: number): Promise<any> {
    const user = await this.prisma.user
      .findUnique({
        where: { id: userId },
        include: {
          role: {
            select: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })
      .catch((error) => {
        throw new RpcException(error.message);
      });

    if (!user) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'user not found',
      });
    }

    return { user: { ...user, role: user.role[0]?.role.name } };
  }

  async getUserByMsisdn(msisdn: string): Promise<any> {
    const user = await this.prisma.user
      .findUnique({
        where: { msisdn: msisdn },
        include: {
          role: {
            select: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })
      .catch((error) => {
        throw new RpcException(error.message);
      });
    if (!user) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'user not found',
      });
    }

    return { user: { ...user, role: user.role[0]?.role.name } };
  }

  async assignRole(data: any): Promise<any> {
    const role = await this.prisma.roles
      .findFirst({
        where: { id: data.roleId },
      })
      .catch((error) => {
        throw new RpcException(error.message);
      });
    await this.prisma.roleUsers
      .update({
        where: {
          userId: data.userId,
        },
        data: { roleId: role.id },
      })
      .catch((error) => {
        throw new RpcException(error.message);
      });
  }

  async getRoles(): Promise<any> {
    const roles = await this.prisma.roles.findMany().catch((error) => {
      throw new RpcException(error.message);
    });
    return { roles };
  }

  async updateUserStatus(data: any): Promise<any> {
    const updated = await this.prisma.user
      .update({
        where: { id: data.userId },
        data: { status: data.status },
      })
      .catch((error) => {
        throw new RpcException(error.message);
      });
    const user = { userId: updated.id, status: updated.status };
    return { user };
  }

  async loginWithPassword(data: any): Promise<any> {
    if (data.login.indexOf('@') !== -1) {
      const user = await this.prisma.user
        .findFirst({
          where: { email: data.login },
          include: {
            role: {
              include: {
                role: {
                  select: { name: true },
                },
              },
            },
          },
        })
        .catch((error) => {
          throw new RpcException(error.message);
        });
      if (user.role[0].role.name === 'CLIENT')
        throw new ForbiddenException('Access Denied');

      const passMatches = await argon
        .verify(user.password, data.password)
        .catch((error) => {
          throw new RpcException(error.message);
        });
      if (!passMatches) throw new RpcException('Invalid Credentials');

      const payload: JwtPayload = {
        userId: user.id,
        msisdn: user.msisdn,
        role: user.role[0].role?.name,
      };
      const tokens = await this.securityService
        .getTokens(payload)
        .catch((error) => {
          throw new RpcException(error.message);
        });
      const token = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      };
      return { tokens: token };
    }

    const user = await this.prisma.user
      .findFirst({
        where: { msisdn: data.login },
        include: {
          role: {
            include: {
              role: {
                select: { name: true },
              },
            },
          },
        },
      })
      .catch((error) => {
        throw new RpcException(error.message);
      });
    if (user?.role[0]?.role?.name === 'CLIENT')
      throw new ForbiddenException('Access Denied');

    // <<<<<<< HEAD
    //     let passMatches
    //     try {
    //       await argon.verify(user?.password, data?.password)
    //     } catch (e) {
    //
    //     }
    //     if (!passMatches) throw new BadRequestException('Invalid Credentials');
    // =======
    const passMatches = await argon
      .verify(user?.password, data?.password)
      .catch((error) => {
        throw new RpcException(error.message);
      });
    if (!passMatches) throw new RpcException('Invalid Credentials');
    // >>>>>>> cf4b6916747fa2b9d3bc6a15438455e0048309c4

    const payload: JwtPayload = {
      userId: user.id,
      msisdn: user.msisdn,
      role: user.role[0].role?.name,
    };
    const tokens = await this.securityService
      .getTokens(payload)
      .catch((error) => {
        throw new RpcException(error.message);
      });
    const token = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };
    return { tokens: token };
  }

  async register(data: any): Promise<any> {
    const newUser = await this.prisma.user
      .create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName,
          email: data.email,
          password: await argon.hash(data.password),
          msisdn: data.msisdn,
          status: data?.status,
          language: data?.language,
        },
      })
      .catch((error) => {
        console.log(error);
        throw new RpcException(error.message);
      });
    delete newUser.password;
    await this.assignDefaultRole(RolesEnum.CLIENT, newUser.id);
    const role = await this.prisma.user
      .findFirst({
        where: { id: newUser.id },
        include: {
          role: {
            include: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })
      .catch((error) => {
        throw new RpcException(error.message);
      });

    const payload: JwtPayload = {
      userId: newUser.id,
      msisdn: newUser?.msisdn,
      role: role.role[0].role?.name,
    };
    const tokens = await this.securityService.getTokens(payload);
    await this.securityService.updateRtHash(newUser.id, tokens.refresh_token);
    const token = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };

    return { user: newUser, tokens: token };
  }

  async registerMerchant(data: any): Promise<any> {
    const newMerchant = await this.prisma.user
      .create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName,
          email: data.email,
          password: await argon.hash(data.password),
          msisdn: data.msisdn,
          status: data?.status,
          language: data?.language,
        },
      })
      .catch((error) => {
        throw new RpcException({
          code: grpc.status.INVALID_ARGUMENT,
          message: error.message,
        });
      });
    await this.assignDefaultRole(RolesEnum.MERCHANT, newMerchant.id);
    const role = await this.prisma.user
      .findFirst({
        where: { id: newMerchant.id },
        include: {
          role: {
            include: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })
      .catch((error) => {
        throw new RpcException({
          code: grpc.status.NOT_FOUND,
          message: error.message,
        });
      });

    const payload: JwtPayload = {
      userId: newMerchant.id,
      msisdn: newMerchant?.msisdn,
      role: role.role[0].role?.name,
    };
    const tokens = await this.securityService.getTokens(payload);
    await this.securityService.updateRtHash(
      newMerchant.id,
      tokens.refresh_token,
    );
    const token = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };

    return { user: newMerchant, tokens: token };
  }

  private async assignDefaultRole(
    name: RolesEnum,
    userId: number,
  ): Promise<any> {
    const role = await this.prisma.roles
      .findFirst({
        where: { name: name },
      })
      .catch((error) => {
        throw new RpcException({
          code: grpc.status.NOT_FOUND,
          message: error.message,
        });
      });

    await this.prisma.roleUsers
      .create({
        data: { userId: userId, roleId: role.id },
      })
      .catch((error) => {
        throw new RpcException(error.message);
      });
  }
}
