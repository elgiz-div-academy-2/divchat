import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsString, MinLength } from 'class-validator';

export class CreateChatDto {
  @Type()
  @IsInt()
  userId: number;

  @Type()
  @IsString()
  message: string;
}

export class CreateChatGroupDto {
  @Type()
  @IsString()
  @MinLength(3)
  name: string;

  @Type()
  @IsNumber({}, { each: true })
  @IsArray()
  participants: number[];
}
