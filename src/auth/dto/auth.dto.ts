import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class AuthDto {
  @IsPhoneNumber()
  @IsNotEmpty()
  phonenumber: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsInt()
  @IsNotEmpty()
  usergroup_id: number;
}

export class GetOTPDto {
  @IsPhoneNumber()
  @IsNotEmpty()
  phonenumber: string;
}

export class OTPDto {
  @IsPhoneNumber()
  @IsNotEmpty()
  phonenumber: string;

  @IsNumber()
  @IsNotEmpty()
  otp: number;
}

export class UpdateBankDetailDto {
  @IsString()
  @IsOptional()
  account_holder_name: string;

  @IsNumber()
  @IsOptional()
  account_number: number;

  @IsString()
  @IsOptional()
  branch_name: string;

  @IsString()
  @IsOptional()
  @Length(11, 11)
  ifsc_code: string;

  @IsNumber()
  @IsOptional()
  bank_id: number;

  @IsString()
  @IsOptional()
  attachment: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsPhoneNumber()
  @IsOptional()
  whatsapp_number: string;

  @IsString()
  @IsOptional()
  @Length(10, 10)
  pan_number: string;

  @IsString()
  @IsOptional()
  @Length(15, 15)
  gstin: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsNumber()
  @IsOptional()
  @MaxLength(4)
  year_of_establishment: number;

  @IsNumber()
  @IsOptional()
  city_id: number;
}

export class UpdateUserDto {
  @Type(() => UpdateProfileDto)
  @ValidateNested()
  profile: {};

  @Type(() => UpdateBankDetailDto)
  @ValidateNested()
  bankdetail: {};
}
