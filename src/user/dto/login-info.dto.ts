import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginInfo {
  @IsString()
  @IsNotEmpty()
  msisdn: string;

  @IsString()
  @IsOptional()
  ipAddress: string;
}
