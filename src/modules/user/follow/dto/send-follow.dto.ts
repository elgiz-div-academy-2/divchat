import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsPositive, Min } from 'class-validator';
import { UpdateFollowStatusEnum } from 'src/shared/enums/follow.enum';

export class ToggleFollowRequestDto {
  @Type()
  @IsInt()
  @IsPositive()
  to: number;
}

export class UpdateFollowStatusDto {
  @Type()
  @IsInt()
  @IsPositive()
  from: number;

  @Type()
  @IsEnum(UpdateFollowStatusEnum)
  status: UpdateFollowStatusEnum;
}

export class RemoveFollowerDto {
  @Type()
  @IsInt()
  @IsPositive()
  followerId: number;
}
