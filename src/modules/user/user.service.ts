import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserEntity } from 'src/database/entities/User.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserService {
  private userRepo: Repository<UserEntity>;

  constructor(@InjectDataSource() private dataSource: DataSource) {
    this.userRepo = this.dataSource.getRepository(UserEntity);
  }

  list() {
    return this.userRepo.find();
  }

  create() {
    return this.userRepo.save(this.userRepo.create({ username: 'john' }));
  }
}
