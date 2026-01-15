import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

/**
 * Alternative Widget entity that matches the existing database schema
 * Uses JSONB for theme and config instead of flat columns
 */

interface WidgetTheme {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  fontFamily?: string;
  whiteLabel?: boolean;
}

interface WidgetConfig {
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  buttonSize?: number;
  chatWindowWidth?: number;
  chatWindowHeight?: number;
  welcomeMessage?: string;
  fallbackMessage?: string;
  confidenceThreshold?: number;
  collectEmail?: boolean;
  showTypingIndicator?: boolean;
}

@Entity('widgets')
export class Widget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, nullable: true })
  category: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'draft',
  })
  status: 'active' | 'draft' | 'inactive';

  @Column({
    type: 'jsonb',
    default: { primaryColor: '#2196F3', secondaryColor: '#1976D2' },
  })
  theme: WidgetTheme;

  @Column({
    type: 'jsonb',
    default: { position: 'bottom-right' },
  })
  config: WidgetConfig;

  @Column({ type: 'int', default: 0 })
  messagesThisMonth: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
