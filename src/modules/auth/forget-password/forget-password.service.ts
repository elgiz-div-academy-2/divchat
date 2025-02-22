import {
  BadRequestException,
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserEntity } from 'src/database/entities/User.entity';
import { DataSource, MoreThan, Repository } from 'typeorm';
import { CreateForgetPasswordDto } from './dto/create-forget-password.dto';
import { UserActivationEntity } from 'src/database/entities/UserActivation.entity';
import { v4 } from 'uuid';
import { addMinutes } from 'date-fns';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { ConfirmForgetPaswordDto } from './dto/confirm-forget-password.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthUtils } from '../auth.utils';

@Injectable()
export class ForgetPasswordService {
  private userRepo: Repository<UserEntity>;
  private activationRepo: Repository<UserActivationEntity>;

  constructor(
    private mailService: MailerService,
    private authUtils: AuthUtils,
    private jwt: JwtService,
    @InjectDataSource() private dataSource: DataSource,
  ) {
    this.userRepo = this.dataSource.getRepository(UserEntity);
    this.activationRepo = this.dataSource.getRepository(UserActivationEntity);
  }

  async createForgetPasswordRequest(params: CreateForgetPasswordDto) {
    let user = await this.userRepo.findOne({
      where: {
        username: params.username,
        email: params.email,
      },
    });

    if (!user) throw new NotFoundException('User is not found');

    let activation = await this.activationRepo.findOne({
      where: {
        userId: user.id,
        expiredAt: MoreThan(new Date()),
      },
    });

    if (!activation) {
      activation = this.activationRepo.create({
        userId: user.id,
        token: v4(),
        expiredAt: addMinutes(new Date(), 30),
      });

      await activation.save();
    }

    if (activation.attempts > 3) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const resetLink = `${params.callbackURL}?token=${activation.token}`;
    try {
      await this.mailService.sendMail({
        to: user.email,
        subject: `Forget Password Request`,
        template: 'forget-password',
        context: {
          username: user.username,
          resetLink,
        },
      });

      activation.attempts += 1;
      await activation.save();

      return {
        message: 'Mail has been successfully sent',
      };
    } catch (err) {
      throw new InternalServerErrorException(
        'Due some reasons, we cannot send mail for forget-password',
      );
    }
  }

  async confirmForgetPassword(params: ConfirmForgetPaswordDto) {
    let activation = await this.activationRepo.findOne({
      where: {
        token: params.token,
        expiredAt: MoreThan(new Date()),
      },
    });

    if (!activation) throw new BadRequestException('Token is not valid');

    if (activation.attempts > 3)
      throw new BadRequestException('Please try again later');

    if (params.newPassword !== params.repeatPassword) {
      throw new BadRequestException(
        'Repeat password is not match with new password',
      );
    }

    let user = await this.userRepo.findOne({
      where: { id: activation.userId },
    });

    if (!user) throw new NotFoundException('User not found');

    user.password = params.newPassword;

    await user.save();

    await this.activationRepo.delete({ userId: user.id });

    let token = this.jwt.sign({ userId: user.id });

    return {
      message: 'Password is successfully updated',
      token,
    };
  }
}
