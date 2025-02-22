import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserEntity } from 'src/database/entities/User.entity';
import { DataSource, FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, LoginWithFirebaseDto } from './dto/login.dto';
import { compare } from 'bcrypt';
import { ClsService } from 'nestjs-cls';
import { LoginAttempts } from 'src/database/entities/LoginAttempts.entity';
import config from 'src/config';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthUtils } from './auth.utils';
import { FirebaseService } from 'src/libs/firebase/firebase.service';
import { UserProvider } from 'src/shared/enums/user.enum';
import { ImageEntity } from 'src/database/entities/Image.entity';
import { v4 } from 'uuid';

@Injectable()
export class AuthService {
  private userRepo: Repository<UserEntity>;
  private loginAttemptsRepo: Repository<LoginAttempts>;
  private imageRepo: Repository<ImageEntity>;

  constructor(
    private cls: ClsService,
    private mailer: MailerService,
    private authUtils: AuthUtils,
    private firebaseService: FirebaseService,
    @InjectDataSource() private dataSource: DataSource,
  ) {
    this.userRepo = this.dataSource.getRepository(UserEntity);
    this.loginAttemptsRepo = this.dataSource.getRepository(LoginAttempts);
    this.imageRepo = this.dataSource.getRepository(ImageEntity);
  }

  async login(params: LoginDto) {
    let identifier = params.username.toLowerCase();
    let where: FindOptionsWhere<UserEntity>[] = [
      {
        username: identifier,
      },
      {
        email: identifier,
      },
      {
        password: identifier,
      },
    ];

    let user = await this.userRepo.findOne({ where });

    if (!user) throw new UnauthorizedException('User or password is wrong');

    await this.checkLoginAttempts(user);

    let checkPassword = await compare(params.password, user.password);

    if (!checkPassword) {
      await this.addLoginAttempt(user);
      throw new UnauthorizedException('User or password is wrong');
    }

    await this.clearLoginAttempts(user);

    return {
      user,
      token: this.authUtils.generateToken(user.id),
    };
  }

  async loginWithFirebase(params: LoginWithFirebaseDto) {
    let admin = this.firebaseService.firebaseApp;

    let firebaseResult = await admin.auth().verifyIdToken(params.token);

    if (!firebaseResult?.uid)
      throw new InternalServerErrorException('Something went wrong');

    let uid = firebaseResult.uid;
    let email = firebaseResult.email;

    let where: FindOptionsWhere<UserEntity>[] = [
      {
        providerId: uid,
        provider: UserProvider.FIREBASE,
      },
    ];

    if (email) {
      where.push({
        email,
      });
    }

    let user = await this.userRepo.findOne({
      where,
    });

    if (!user) {
      let suggestions = await this.usernameSuggestions(firebaseResult.name);

      let image = firebaseResult.picture
        ? await this.imageRepo.save({
            url: firebaseResult.picture,
          })
        : undefined;

      user = this.userRepo.create({
        username: suggestions[0],
        email,
        password: v4(),
        provider: UserProvider.FIREBASE,
        providerId: uid,
        profile: {
          fullName: firebaseResult.name,
          imageId: image?.id,
        },
      });

      await user.save();
    }

    let token = this.authUtils.generateToken(user.id);

    return {
      user,
      token,
    };
  }

  async register(params: RegisterDto) {
    if (!params.phone && !params.email)
      throw new BadRequestException('Email or phone number needs to be filled');

    let username = params.username.toLowerCase();
    const email = params.email?.toLocaleLowerCase();
    const phone = params.phone;

    let where: FindOptionsWhere<UserEntity>[] = [
      {
        username,
      },
    ];

    if (email) {
      where.push({
        email,
      });
    }

    if (phone) {
      where.push({
        phone,
      });
    }

    let userExists = await this.userRepo.findOne({
      where,
    });

    if (userExists) {
      if (userExists.username === username) {
        throw new ConflictException({
          message: 'Username is already exists',
          suggestions: await this.usernameSuggestions(username),
        });
      } else if (userExists.email === email) {
        throw new ConflictException({ message: 'Email is already exists' });
      } else {
        throw new ConflictException({ message: 'Phone is already exists' });
      }
    }

    let user = this.userRepo.create({
      username,
      email,
      phone,
      password: params.password,
      profile: {
        fullName: params.fullName,
      },
    });
    await user.save();

    let token = this.authUtils.generateToken(user.id);

    if (email) {
      let mailResult = await this.mailer.sendMail({
        to: email,
        subject: 'Welcome to DivChat',
        template: 'welcome',
        context: {
          username: user.username,
        },
      });
    }
    return { user, token };
  }

  async checkLoginAttempts(user: UserEntity) {
    let ip = this.cls.get('ip');

    let attempts = await this.loginAttemptsRepo.count({
      where: {
        userId: user.id,
        ip,
      },
    });

    if (attempts >= config.loginAttempts) {
      throw new HttpException(
        'Please try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async addLoginAttempt(user: UserEntity) {
    let ip = this.cls.get('ip');

    let attempt = this.loginAttemptsRepo.create({
      ip,
      userId: user.id,
      createdAt: new Date(),
    });

    await attempt.save();
    return true;
  }

  async clearLoginAttempts(user: UserEntity) {
    let ip = this.cls.get('ip');
    await this.loginAttemptsRepo.delete({ ip, userId: user.id });
  }

  async usernameSuggestions(username: string) {
    username = username
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/^-+|-+$/g, '');

    let usernames = Array.from({ length: 8 }).map(
      () => `${username}${Math.floor(Math.random() * 8999) + 1000}`,
    );
    let dbUsernames = await this.userRepo.find({
      where: {
        username: In(usernames),
      },
      select: {
        id: true,
        username: true,
      },
    });

    let existUsernames = dbUsernames.map((user) => user.username);

    usernames = usernames.filter(
      (username) => !existUsernames.includes(username),
    );

    return usernames.slice(0, 2);
  }

  async resetPassword(params: ResetPasswordDto) {
    let user = this.cls.get<UserEntity>('user');

    if (params.newPassword !== params.repeatPassword) {
      throw new BadRequestException('Repeat password is wrong');
    }

    let checkPassword = await compare(params.currentPassword, user.password);

    if (!checkPassword) throw new BadRequestException('Password is wrong');

    user.password = params.newPassword;

    await user.save();

    return {
      message: 'Password is updated successfully',
    };
  }
}
