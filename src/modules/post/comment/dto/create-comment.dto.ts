import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @Type()
  @IsString()
  @MinLength(1)
  content: string;

  @Type()
  @IsNumber()
  @IsOptional()
  replyId?: number;
}
