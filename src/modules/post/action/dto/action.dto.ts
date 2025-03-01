import { Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { PostActionTypes } from 'src/shared/enums/post.enum';

export class PostActionDto {
  @Type()
  @IsEnum(PostActionTypes)
  type: PostActionTypes;
}
