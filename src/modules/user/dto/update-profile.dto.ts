import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class UpdateProfileDto {
  @Type()
  @IsOptional()
  @IsString()
  @Length(5, 50)
  fullName?: string;

  @Type()
  @IsOptional()
  @IsString()
  bio?: string;

  @Type()
  @IsOptional()
  @IsUUID()
  @IsString()
  imageId?: string;

  @Type()
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
