import { Ip, Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClsModule } from 'nestjs-cls';
import { Request } from 'express';
import { ScheduleModule } from '@nestjs/schedule';
import { JobModule } from './jobs/job.module';
import { UploadModule } from './modules/upload/upload.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { FollowModule } from './modules/user/follow/follow.module';
import { MediaModule } from './modules/media/media.module';
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/post/comment/comment.module';
import { ActionModule } from './modules/post/action/action.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          url: config.get('DATABASE_URL'),
          entities: [join(__dirname, 'database/entities/*.entity.{ts,js}')],
          migrations: [join(__dirname, 'database/migrations/*.{ts,js}')],
          logging: true,
          synchronize: true,
        };
      },
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          secret: config.get('JWT_SECRET'),
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ScheduleModule.forRoot(),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req: Request) => {
          cls.set('ip', req.ip);
        },
      },
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          transport: {
            service: 'gmail',
            host: config.get('SMTP_HOST'),
            port: config.get('SMTP_PORT'),
            secure: config.get('SMTP_SECURE'),
            auth: {
              user: config.get('SMTP_USER'),
              pass: config.get('SMTP_PASS'),
            },
          },
          defaults: {
            from: `"divchat" <${config.get('SMTP_FROM')}>`,
          },
          template: {
            dir: __dirname + '/templates',
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
    UserModule,
    AuthModule,
    UploadModule,
    MediaModule,
    PostModule,
    JobModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
