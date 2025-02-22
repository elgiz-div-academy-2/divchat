import { Module } from '@nestjs/common';
import { ForgetPasswordController } from './forget-password.controller';
import { ForgetPasswordService } from './forget-password.service';
import { AuthUtils } from '../auth.utils';

@Module({
  imports: [],
  controllers: [ForgetPasswordController],
  providers: [ForgetPasswordService, AuthUtils],
})
export class ForgetPasswordModule {}
