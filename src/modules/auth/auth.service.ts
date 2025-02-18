import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserEntity } from 'src/database/entities/User.entity';
import { DataSource, FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { compare } from 'bcrypt';
import { ClsService } from 'nestjs-cls';
import { LoginAttempts } from 'src/database/entities/LoginAttempts.entity';
import config from 'src/config';

@Injectable()
export class AuthService {
  private userRepo: Repository<UserEntity>;
  private loginAttemptsRepo: Repository<LoginAttempts>;

  constructor(
    private cls: ClsService,
    private jwt: JwtService,
    @InjectDataSource() private dataSource: DataSource,
  ) {
    this.userRepo = this.dataSource.getRepository(UserEntity);
    this.loginAttemptsRepo = this.dataSource.getRepository(LoginAttempts);
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
      token: this.generateToken(user.id),
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

    let token = this.generateToken(user.id);
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

  generateToken(userId: number) {
    return this.jwt.sign({ userId });
  }
}
