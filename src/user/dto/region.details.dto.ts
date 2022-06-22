import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegionDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
