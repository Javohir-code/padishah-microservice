import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Language } from '../enums/language.enum';
import { UserStatus } from '../enums/user-status.enum';

export class UserDetailsDto {
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  middleName: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  msisdn: string;

  @IsString()
  @IsOptional()
  status: UserStatus;

  @IsString()
  @IsOptional()
  language: Language;
}
