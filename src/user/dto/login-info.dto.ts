import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OtpReason } from '../enums/otp-reason.enum';

export class LoginInfo {
  @IsString()
  @IsNotEmpty()
  msisdn: string;

  @IsString()
  @IsOptional()
  ipAddress: string;

  @IsString()
  @IsIn([OtpReason.FORGETPASSWORD, OtpReason.LOGIN])
  @IsOptional()
  reason: OtpReason;
}
