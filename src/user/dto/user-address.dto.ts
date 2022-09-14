import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserAddressCreateDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  regionId: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsNotEmpty()
  districtId: number;

  @IsString()
  @IsOptional()
  comment: string;

  @IsString()
  @IsOptional()
  postalCode: string;

  @IsBoolean()
  @IsOptional()
  default: boolean;

  @IsDate()
  @IsOptional()
  createdAt: Date;

  @IsDate()
  @IsOptional()
  updatedAt: Date;
}

export class UserAddressCommonDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  regionId: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsNotEmpty()
  districtId: number;

  @IsString()
  @IsOptional()
  comment: string;

  @IsString()
  @IsOptional()
  postalCode: string;

  @IsBoolean()
  @IsOptional()
  default: boolean;

  @IsDate()
  @IsOptional()
  createdAt: Date;

  @IsDate()
  @IsOptional()
  updatedAt: Date;
}

export class UserAddressDeleteDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class UserAddressGetAllResponseDto {
  result: UserAddressCommonDto[] | undefined;
  errors?: string[];
}

export class UserAddressCreateResponseDto {
  result: UserAddressCommonDto | undefined;
  errors?: string[];
}

export class UserAddressUpdateResponseDto {
  result: UserAddressCommonDto | undefined;
  errors?: string[];
}

export class UserAddressDeleteResponseDto {
  status: boolean;
  errors?: string[];
}

export class UserAddressGetAllDto {
  userId: number;
}
