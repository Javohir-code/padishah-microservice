import {
  IsEmail,
  IsIn,
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
  @IsOptional()
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
  @IsIn([UserStatus.ACTIVE, UserStatus.BLOCK, UserStatus.INAVTIVE])
  @IsOptional()
  status: UserStatus;

  @IsString()
  @IsIn([Language.UZ, Language.RU, Language.ENG])
  @IsOptional()
  language: Language;
}
