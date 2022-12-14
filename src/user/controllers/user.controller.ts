import { Controller } from '@nestjs/common';
import { User } from '@prisma/client';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from '../services/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserController', 'AddUser')
  async addUser(body: any): Promise<{
    user: User;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    return await this.userService.addUserDetails(body.userId, body.user);
  }

  @GrpcMethod('UserController', 'Login')
  async login(data: any): Promise<any> {
    this.userService.login(data);
  }

  @GrpcMethod('UserController', 'VerifyTheNumber')
  async verifyTheNumber(data: any): Promise<any> {
    return await this.userService.verifyTheNumber(data.msisdn, data.code);
  }

  @GrpcMethod('UserController', 'AddPassword')
  async addPassword(data: any): Promise<void> {
    await this.userService.addPassword(data.user, data.password);
  }

  @GrpcMethod('UserController', 'ForgetPassword')
  async forgetPassword(data: any) {
    await this.userService.getForgetPasswordOtp(data.msisdn);
  }

  @GrpcMethod('UserController', 'ChangePassword')
  async changePassword(data: any): Promise<void> {
    await this.userService.changePassword(
      data.msisdn,
      data.code,
      data.password,
    );
  }

  @GrpcMethod('UserController', 'LogoutUser')
  async logoutUser(data: any): Promise<any> {
    return await this.userService.logout(data.user.userId);
  }

  @GrpcMethod('UserController', 'RefreshTokens')
  async refreshTokens(data: any): Promise<any> {
    return await this.userService.refreshTokens(
      data.user.userId,
      data.refreshToken,
    );
  }

  @GrpcMethod('UserController', 'GetUserById')
  async getUserById(data: any): Promise<any> {
    return await this.userService.getUserById(data.userId);
  }

  @GrpcMethod('UserController', 'GetUserByMsisdn')
  async getUserByMsisdn(data: any): Promise<any> {
    return await this.userService.getUserByMsisdn(data.msisdn);
  }

  @GrpcMethod('UserController', 'AssignRole')
  async assignRole(data: any): Promise<any> {
    return await this.userService.assignRole(data.role);
  }

  @GrpcMethod('UserController', 'GetRoles')
  async getRoles(): Promise<any> {
    return await this.userService.getRoles();
  }

  @GrpcMethod('UserController', 'UpdateStatus')
  async updateStatus(data: any): Promise<any> {
    return await this.userService.updateUserStatus(data.user);
  }

  @GrpcMethod('UserController', 'LoginWithPassword')
  async loginWithPassword(data: any): Promise<any> {
    return await this.userService.loginWithPassword(data);
  }

  @GrpcMethod('UserController', 'Register')
  async register(data: any): Promise<any> {
    try {
      const response = await this.userService.register(data.user);
      return response;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  @GrpcMethod('UserController', 'RegisterMerchant')
  async registerMerchant(data: any): Promise<any> {
    return await this.userService.registerMerchant(data.user);
  }

  @GrpcMethod('UserController', 'UpdateUser')
  async updateUser(data: any): Promise<any> {
    return await this.userService.updateUserDetails(data.user, data.userId);
  }
}
