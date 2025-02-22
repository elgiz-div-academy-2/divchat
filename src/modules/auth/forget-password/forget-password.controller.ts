import { Body, Controller, Post } from '@nestjs/common';
import { ForgetPasswordService } from './forget-password.service';
import { CreateForgetPasswordDto } from './dto/create-forget-password.dto';
import { ConfirmForgetPaswordDto } from './dto/confirm-forget-password.dto';

@Controller('auth/forget-password')
export class ForgetPasswordController {
  constructor(private forgetPasswordService: ForgetPasswordService) {}

  @Post('/')
  createForgetPasswordRequest(@Body() body: CreateForgetPasswordDto) {
    return this.forgetPasswordService.createForgetPasswordRequest(body);
  }

  @Post('/confirm')
  confirmPassword(@Body() body: ConfirmForgetPaswordDto) {
    return this.forgetPasswordService.confirmForgetPassword(body);
  }
}
