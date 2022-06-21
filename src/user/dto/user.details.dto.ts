import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserDetailsDto {
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @MinLength(5)
  @MaxLength(100)
  @IsNotEmpty()
  address: string;

  @IsString()
  @MinLength(5)
  @MaxLength(50)
  @IsOptional()
  address2: string;
}
