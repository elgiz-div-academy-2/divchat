import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ForgetPasswordModule } from './forget-password/forget-password.module';
import { AuthUtils } from './auth.utils';
import { FirebaseModule } from 'src/libs/firebase/firebase.module';

@Module({
  imports: [FirebaseModule, ForgetPasswordModule],
  controllers: [AuthController],
  providers: [AuthService, AuthUtils],
})
export class AuthModule {}
