import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

/**
 * AuditLog entity tracks all super admin actions for compliance and security.
 * Provides a complete audit trail of platform-level operations.
 */
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The super admin who performed the action
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'superAdminId' })
  superAdmin: User;

  @Column('uuid')
  superAdminId: string;

  // Type of action performed
  @Column()
  actionType: string; // 'view', 'create', 'update', 'delete', 'impersonate', 'export'

  // Target organization (if applicable)
  @ManyToOne(() => Organization, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'targetOrganizationId' })
  targetOrganization: Organization;

  @Column('uuid', { nullable: true })
  targetOrganizationId: string | null;

  // Type of resource affected
  @Column({ nullable: true })
  targetResourceType: string | null; // 'user', 'widget', 'organization', 'training_source', etc.

  // ID of the specific resource
  @Column('uuid', { nullable: true })
  targetResourceId: string | null;

  // Additional context (before/after values, filters used, etc.)
  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  // Request metadata for security
  @Column({ type: 'inet', nullable: true })
  ipAddress: string | null;

  @Column({ nullable: true })
  userAgent: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
