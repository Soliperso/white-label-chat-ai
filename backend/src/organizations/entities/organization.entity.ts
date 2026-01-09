import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  brandingConfig: {
    primaryColor?: string;
    secondaryColor?: string;
    customDomain?: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: ['starter', 'pro', 'enterprise'],
    default: 'starter',
  })
  plan: 'starter' | 'pro' | 'enterprise';

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
