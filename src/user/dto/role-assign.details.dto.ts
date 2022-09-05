import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RoleDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  roleId: number;
}
