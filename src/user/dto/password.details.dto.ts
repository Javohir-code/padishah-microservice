import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PasswordDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  repassword: string;
}
