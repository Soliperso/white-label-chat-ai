import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'manager', 'viewer', 'super_admin'],
    default: 'viewer',
  })
  role: 'admin' | 'manager' | 'viewer' | 'super_admin';

  @Column({ nullable: true })
  profilePictureUrl: string;

  // Foreign key relationship with Organization
  // Nullable for super_admin users who exist outside org hierarchy
  @ManyToOne(() => Organization, (org) => org.users, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column('uuid', { nullable: true })
  organizationId: string | null;

  // Super admin metadata for impersonation state and session info
  @Column({ type: 'jsonb', default: '{}' })
  superAdminMetadata: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
