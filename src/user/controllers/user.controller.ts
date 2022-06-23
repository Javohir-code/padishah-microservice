import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import { AddressDto } from '../dto/address.details.dto';
import { LoginInfo } from '../dto/login-info.dto';
import { UserDetailsDto } from '../dto/user.details.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IRequestUser } from '../interfaces/request-user.interface';
import { UserService } from '../services/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('add-details')
  @UseGuards(JwtAuthGuard)
  async addUser(
    @CurrentUser() user: IRequestUser,
    @Body() userDetailsDto: UserDetailsDto,
  ): Promise<{ user: User; accessToken: string }> {
    return await this.userService.addUserDetails(user, userDetailsDto);
  }

  @Post('login')
  async loginUser(@Body() loginInfo: LoginInfo) {
    return await this.userService.loginUser(loginInfo);
  }

  @Post('verify')
  async verifyTheNumber(
    @Body('msisdn') msisdn: string,
  ): Promise<{ accessToken: string }> {
    return await this.userService.verifyTheNumber(msisdn);
  }
}
