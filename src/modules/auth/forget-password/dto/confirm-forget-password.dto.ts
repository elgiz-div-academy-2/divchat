import { Type } from 'class-transformer';
import { IsString, IsUUID, Length, MinLength } from 'class-validator';

export class ConfirmForgetPaswordDto {
  @Type()
  @IsString()
  @IsUUID()
  token: string;

  @Type()
  @IsString()
  @MinLength(6)
  newPassword: string;

  @Type()
  @IsString()
  @MinLength(6)
  repeatPassword: string;
}
