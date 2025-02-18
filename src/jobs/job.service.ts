import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { addHours } from 'date-fns';
import { LoginAttempts } from 'src/database/entities/LoginAttempts.entity';
import { DataSource, LessThan, MoreThan, Repository } from 'typeorm';

@Injectable()
export class JobService {
  private loginAttemptRepo: Repository<LoginAttempts>;

  constructor(@InjectDataSource() private dataSource: DataSource) {
    this.loginAttemptRepo = this.dataSource.getRepository(LoginAttempts);
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async clearLoginAttempts() {
    await this.loginAttemptRepo.delete({
      createdAt: LessThan(addHours(new Date(), -1)),
    });
  }
}
