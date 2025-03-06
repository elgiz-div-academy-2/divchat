import { Type } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class CreateMessageDto {
  @Type()
  @IsString()
  @MinLength(1)
  content: string;
}
