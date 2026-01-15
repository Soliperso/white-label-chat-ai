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

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'active',
  })
  status: 'active' | 'draft' | 'inactive';

  // Branding configuration
  @Column({ length: 7, default: '#4F46E5' })
  primaryColor: string;

  @Column({ length: 7, default: '#9333EA' })
  accentColor: string;

  @Column({ length: 255, nullable: true })
  logoUrl: string;

  @Column({ length: 100, default: 'Arial, sans-serif' })
  fontFamily: string;

  @Column({ default: false })
  whiteLabel: boolean;

  // Behavior configuration
  @Column({ length: 255, default: 'Hi! How can I help you today?' })
  welcomeMessage: string;

  @Column({ length: 255, default: "I'm sorry, I don't know how to answer that." })
  fallbackMessage: string;

  @Column({ type: 'float', default: 0.7 })
  confidenceThreshold: number;

  @Column({ default: true })
  collectEmail: boolean;

  @Column({ default: true })
  showTypingIndicator: boolean;

  // Widget position and styling
  @Column({
    type: 'varchar',
    length: 20,
    default: 'bottom-right',
  })
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

  @Column({ type: 'int', default: 60 })
  buttonSize: number;

  @Column({ type: 'int', default: 400 })
  chatWindowWidth: number;

  @Column({ type: 'int', default: 600 })
  chatWindowHeight: number;

  // Analytics
  @Column({ type: 'int', default: 0 })
  totalConversations: number;

  @Column({ type: 'int', default: 0 })
  totalMessages: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
