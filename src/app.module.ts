import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
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
    UserModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
