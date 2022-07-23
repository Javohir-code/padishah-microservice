import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GrpcMethod } from '@nestjs/microservices';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import { CurrentUserRt } from 'src/global/decorators/current-user-rt.decorator';
import { LoginInfo } from '../dto/login-info.dto';
import { PasswordDto } from '../dto/password.details.dto';
import { UserDetailsDto } from '../dto/user.details.dto';
import { AtAuthGuard } from '../guards/at-auth.guard';
import { RtAuthGuard } from '../guards/rt-auth.guard';
import { IRequestUser } from '../interfaces/request-user.interface';
import { UserService } from '../services/user.service';
import { Tokens } from '../types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserController', 'AddUser')
  @UseGuards(AtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addUser(
    @CurrentUser() user: IRequestUser,
    @Body() userDetailsDto: UserDetailsDto,
  ): Promise<{
    user: User;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    return await this.userService.addUserDetails(user, userDetailsDto);
  }

  // @Post('login')
  @GrpcMethod('UserController', 'Login')
  @HttpCode(HttpStatus.OK)
  async loginUser(@Body() loginInfo: LoginInfo) {
    return await this.userService.loginUser(loginInfo);
  }

  // @Post('verify')
  @GrpcMethod('UserController', 'VerifyTheNumber')
  @HttpCode(HttpStatus.OK)
  async verifyTheNumber(
    @Body('msisdn') msisdn: string,
    @Body('code') code: string,
  ): Promise<Tokens> {
    return await this.userService.verifyTheNumber(msisdn, code);
  }

  // @Put('add-password')
  @GrpcMethod('UserController', 'AddPassword')
  @UseGuards(AtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async addPassword(
    @CurrentUser() user: IRequestUser,
    @Body() passwordDto: PasswordDto,
  ): Promise<void> {
    await this.userService.addPassword(user, passwordDto);
  }

  // @Post('forget-password')
  @GrpcMethod('UserController', 'ForgetPassword')
  async getForgetPasswordOtp(@Body('msisdn') msisdn: string) {
    await this.userService.getForgetPasswordOtp(msisdn);
  }

  // @Put('change-password')
  @GrpcMethod('UserController', 'ChangePassword')
  async changePassword(
    @Body('msisdn') msisdn: string,
    @Body('code') code: string,
    @Body() passwordDto: PasswordDto,
  ): Promise<void> {
    await this.userService.changePassword(msisdn, code, passwordDto);
  }

  // @Post('logout')
  @GrpcMethod('UserController', 'LogoutUser')
  @UseGuards(AtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutUser(@CurrentUser() user: IRequestUser): Promise<boolean> {
    return await this.userService.logout(user.userId);
  }

  // @Post('refresh')
  @GrpcMethod('UserController', 'RefreshTokens')
  @UseGuards(RtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @CurrentUser() user: IRequestUser,
    @CurrentUserRt('refreshToken') rt: string,
  ) {
    return await this.userService.refreshTokens(user.userId, rt);
  }
}
