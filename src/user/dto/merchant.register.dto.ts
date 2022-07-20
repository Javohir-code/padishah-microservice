import { Language, UserStatus } from '@prisma/client';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class MerchantRegister {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  middleName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  msisdn: string;

  @IsString()
  @IsOptional()
  status: UserStatus;

  @IsString()
  @IsIn([Language.UZ, Language.RU, Language.ENG])
  @IsOptional()
  language: Language;
}
