import { Type } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @Type()
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @Type()
  @IsString()
  @MinLength(6)
  newPassword: string;

  @Type()
  @IsString()
  @MinLength(6)
  repeatPassword: string;
}
