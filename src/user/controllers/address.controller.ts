import { Controller, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ExceptionFilter } from 'src/filters/bad-request-exception.filter';
import {
  UserAddressCommonDto,
  UserAddressCreateDto,
  UserAddressCreateResponseDto,
  UserAddressDeleteDto,
  UserAddressDeleteResponseDto,
  UserAddressGetAllDto,
  UserAddressGetAllResponseDto,
  UserAddressUpdateResponseDto,
} from '../dto/user-address.dto';
import { AddressService } from '../services/address.service';

@Controller()
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @GrpcMethod('AddressController', 'GetAll')
  async getAll(
    data: UserAddressGetAllDto,
  ): Promise<UserAddressGetAllResponseDto> {
    try {
      const result = await this.addressService.getAll(data.userId);
      return {
        result,
      };
    } catch (error) {
      console.log(error);
      return {
        result: undefined,
        errors: [error.message],
      };
    }
  }

  @GrpcMethod('AddressController', 'Create')
  async create(
    data: UserAddressCreateDto,
  ): Promise<UserAddressCreateResponseDto> {
    try {
      const result = await this.addressService.create(data);
      return {
        result,
      };
    } catch (error) {
      console.log(error);
      return {
        result: undefined,
        errors: [error.message],
      };
    }
  }

  @GrpcMethod('AddressController', 'Update')
  async update(
    data: UserAddressCommonDto,
  ): Promise<UserAddressUpdateResponseDto> {
    try {
      const { id } = data;
      delete data.id;
      const result = await this.addressService.update(id, data);
      return {
        result,
      };
    } catch (error) {
      console.log(error);
      return {
        result: undefined,
        errors: [error.message],
      };
    }
  }

  @UseFilters(new ExceptionFilter())
  @GrpcMethod('AddressController', 'Delete')
  async delete(
    data: UserAddressDeleteDto,
  ): Promise<UserAddressDeleteResponseDto> {
    try {
      const { id, userId } = data;
      const result = await this.addressService.delete(id, userId);
      return result;
    } catch (error) {
      console.log(error);
      return {
        status: false,
        errors: [error.message],
      };
    }
  }
}
