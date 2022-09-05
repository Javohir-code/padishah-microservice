import { IsNotEmpty, IsString } from 'class-validator';

export class LoginWithPassword {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
