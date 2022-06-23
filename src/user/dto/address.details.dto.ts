import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  latitude: string;

  @IsString()
  @IsNotEmpty()
  longitude: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  street: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  @IsOptional()
  home: string;

  @IsString()
  @IsOptional()
  apartment: string;

  @IsString()
  @IsOptional()
  comment: string;

  @IsString()
  @IsOptional()
  domofon: string;

  @IsString()
  @IsOptional()
  address: string;
}
