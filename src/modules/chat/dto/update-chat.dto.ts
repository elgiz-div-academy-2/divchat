import { PartialType } from '@nestjs/swagger';
import { CreateChatGroupDto } from './create-chat.dto';

export class UpdateChatGroupDto extends PartialType(CreateChatGroupDto) {}
