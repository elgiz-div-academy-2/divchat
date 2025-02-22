import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_activations')
export class UserActivationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  token: string;

  @Column({ default: 0 })
  attempts: number;

  @Column({ type: 'timestamptz' })
  expiredAt: Date;
}
