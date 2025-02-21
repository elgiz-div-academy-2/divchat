import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from '../enums/user.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { Role } from './role.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

export const Auth = (...roles: UserRole[]) =>
  applyDecorators(UseGuards(AuthGuard), Role(...roles), ApiBearerAuth());
