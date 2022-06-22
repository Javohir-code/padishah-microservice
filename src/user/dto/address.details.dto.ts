import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserStatus } from '../enums/user-status.enum';

export class AddressDto {
  @IsString()
  @IsOptional()
  apartment: string;

  @IsString()
  @IsOptional()
  home: string;

  @IsString()
  @IsNotEmpty()
  latitude: string;

  @IsString()
  @IsNotEmpty()
  longitude: string;

  @IsString()
  @IsOptional()
  domofon: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  status: UserStatus;
}
