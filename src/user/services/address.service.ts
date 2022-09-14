import { Injectable } from '@nestjs/common';
import { notEqual } from 'assert';
import { PrismaService } from 'src/user/services/prisma.service';

import {
  UserAddressCommonDto,
  UserAddressCreateDto,
  UserAddressDeleteResponseDto,
} from '../dto/user-address.dto';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async getAll(userId: number): Promise<UserAddressCommonDto[]> {
    try {
      const result = await this.prisma.userAddresses.findMany({
        where: {
          userId,
        },
      });

      return result;
    } catch (error) {
      console.log(error);
      throw new Error('Something went wrong, please try agan later!');
    }
  }

  async create(data: UserAddressCreateDto): Promise<UserAddressCommonDto> {
    console.log(data);
    try {
      const result = await this.prisma.userAddresses.create({
        data,
      });

      if (data.default) {
        await this.prisma.userAddresses.updateMany({
          data: {
            default: false,
          },
          where: {
            userId: data.userId,
            id: {
              not: result.id,
            },
          },
        });
      }

      return result;
    } catch (error) {
      console.log(error);
      throw new Error('Something went wrong, please try agan later!');
    }
  }

  async update(
    id: number,
    data: UserAddressCommonDto,
  ): Promise<UserAddressCommonDto> {
    try {
      const address = await this.prisma.userAddresses.findFirst({
        where: {
          id,
          userId: data.userId,
        },
      });

      if (!address) {
        throw new Error('Invalid Address. Access Restricted');
      }

      const result = await this.prisma.userAddresses.update({
        where: {
          id,
        },
        data,
      });
      // if this address is set to default then before marking this as default mark all other address default as false for that user.
      if (data.default) {
        await this.prisma.userAddresses.updateMany({
          data: {
            default: false,
          },
          where: {
            userId: data.userId,
            id: {
              not: address.id,
            },
          },
        });
      }

      return result;
    } catch (error) {
      console.log(error);
      throw new Error('Something went wrong, please try agan later!');
    }
  }

  async delete(
    id: number,
    userId: number,
  ): Promise<UserAddressDeleteResponseDto> {
    try {
      const address = await this.prisma.userAddresses.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!address) {
        throw new Error('Invalid Address. Access Restricted');
      }

      await this.prisma.userAddresses.delete({
        where: {
          id: address.id,
        },
      });

      return {
        status: true,
      };
    } catch (error) {
      console.log(error);
      throw new Error('Something went wrong, please try agan later!');
    }
  }
}
