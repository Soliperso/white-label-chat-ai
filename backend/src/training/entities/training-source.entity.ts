import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('training_sources')
export class TrainingSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  organizationId: string;

  @Column('uuid')
  widgetId: string;

  @Column({
    type: 'enum',
    enum: ['url', 'file', 'qna'],
  })
  sourceType: string;

  @Column('jsonb', { nullable: true })
  metadata: {
    // For URL type
    url?: string;
    crawlDepth?: number;
    // For FILE type
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    storageUrl?: string;
    // For QA_PAIR type
    question?: string;
    answer?: string;
  };

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'int', default: 0 })
  totalChunks: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
