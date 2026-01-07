import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('training_jobs')
export class TrainingJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  organizationId: string;

  @Column('uuid')
  widgetId: string;

  @Column({
    type: 'enum',
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued',
  })
  status: string;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'int', default: 0 })
  totalItems: number;

  @Column({ type: 'int', default: 0 })
  processedItems: number;

  @Column({ type: 'bigint', nullable: true })
  startedAt: number | null;

  @Column({ type: 'bigint', nullable: true })
  completedAt: number | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
