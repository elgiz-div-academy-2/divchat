import { Type } from 'class-transformer';
import { IsAlphanumeric, IsEmail, IsString, IsUrl } from 'class-validator';

export class CreateForgetPasswordDto {
  @Type()
  @IsString()
  @IsAlphanumeric()
  username: string;

  @Type()
  @IsEmail()
  email: string;

  @Type()
  @IsString()
  callbackURL: string = 'http://localhost:3000/forget-password.html';
}
