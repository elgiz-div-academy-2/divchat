import { Type } from 'class-transformer';
import {
  IsAlphanumeric,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @Type()
  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string = 'test@example.com';

  @Type()
  @IsString()
  @IsOptional()
  @Length(6, 15)
  @Matches(/^\+[\d]+$/, { message: 'phone number is not valid' })
  phone?: string = '+99412345678';

  @Type()
  @IsString()
  @MinLength(6)
  password: string = '123456';

  @Type()
  @IsString()
  @Length(4, 20)
  @IsAlphanumeric()
  username: string;

  @Type()
  @IsString()
  @IsOptional()
  @Length(5, 50)
  fullName?: string;
}
