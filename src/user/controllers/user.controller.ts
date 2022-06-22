import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/global/decorators/current-user.decorator';
import { AddressDto } from '../dto/address.details.dto';
import { UserDetailsDto } from '../dto/user.details.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IRequestUser } from '../interfaces/request-user.interface';
import { UserService } from '../services/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('add-details')
  @UseGuards(JwtAuthGuard)
  async addUser(
    @CurrentUser() user: IRequestUser,
    @Body() userDetailsDto: UserDetailsDto,
    @Body() addressDto: AddressDto,
  ): Promise<{ user: User; accessToken: string }> {
    return await this.userService.addUserDetails(
      user,
      userDetailsDto,
      addressDto,
    );
  }

  @Post('login')
  async loginUser(@Body('msisdn') msisdn: string) {
    return await this.userService.loginUser(msisdn);
  }

  @Post('verify')
  async verifyTheNumber(
    @Body('msisdn') msisdn: string,
  ): Promise<{ accessToken: string }> {
    return await this.userService.verifyTheNumber(msisdn);
  }
}
