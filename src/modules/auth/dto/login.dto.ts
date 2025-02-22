import { Type } from 'class-transformer';
import { IsString, Length, MinLength } from 'class-validator';

export class LoginDto {
  @Type()
  @IsString()
  @MinLength(4)
  username: string;

  @Type()
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginWithFirebaseDto {
  @Type()
  @IsString()
  token: string;
}
