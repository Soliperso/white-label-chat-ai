import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTrainingSourceDto } from './dto/create-training-source.dto';
import { SupabaseService } from '../auth/supabase.service';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface TrainingSource {
  id: string;
  organizationId: string;
  widgetId: string;
  sourceType: 'url' | 'file' | 'qna';
  metadata: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalChunks?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingJob {
  id: string;
  organizationId: string;
  widgetId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalItems: number;
  processedItems: number;
  startedAt: number;
  completedAt?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class TrainingService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAllByWidget(
    widgetId: string,
    organizationId: string,
  ): Promise<TrainingSource[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('training_sources')
      .select('*')
      .eq('widgetId', widgetId)
      .eq('organizationId', organizationId)
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch training sources: ${error.message}`);
    }

    return (data || []) as TrainingSource[];
  }

  async createUrlSource(
    widgetId: string,
    organizationId: string,
    dto: CreateTrainingSourceDto,
  ): Promise<TrainingSource> {
    const supabase = this.supabaseService.getClient();

    const { data: source, error } = await supabase
      .from('training_sources')
      .insert({
        organizationId,
        widgetId,
        sourceType: 'url',
        metadata: {
          url: dto.url,
          crawlDepth: dto.crawlDepth || 1,
        },
        status: 'pending',
      })
      .select()
      .single();

    if (error || !source) {
      throw new Error(`Failed to create URL source: ${error?.message}`);
    }

    // Mock processing - simulate crawling
    this.mockProcessUrlSource(source.id);

    return source as TrainingSource;
  }

  async createFileSource(
    widgetId: string,
    organizationId: string,
    file: Express.Multer.File,
  ): Promise<TrainingSource> {
    const supabase = this.supabaseService.getClient();

    // Save file to disk
    const uploadDir = path.join(
      process.cwd(),
      'uploads',
      organizationId,
      widgetId,
    );
    await fs.mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname}`;
    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, file.buffer);

    const { data: source, error } = await supabase
      .from('training_sources')
      .insert({
        organizationId,
        widgetId,
        sourceType: 'file',
        metadata: {
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          storageUrl: filePath,
        },
        status: 'pending',
      })
      .select()
      .single();

    if (error || !source) {
      throw new Error(`Failed to create file source: ${error?.message}`);
    }

    // Mock processing
    this.mockProcessFileSource(source.id, file.size);

    return source as TrainingSource;
  }

  async createQASource(
    widgetId: string,
    organizationId: string,
    dto: CreateTrainingSourceDto,
  ): Promise<TrainingSource> {
    const supabase = this.supabaseService.getClient();

    const { data: source, error } = await supabase
      .from('training_sources')
      .insert({
        organizationId,
        widgetId,
        sourceType: 'qna',
        metadata: {
          question: dto.question,
          answer: dto.answer,
        },
        status: 'completed',
        totalChunks: 1,
      })
      .select()
      .single();

    if (error || !source) {
      throw new Error(`Failed to create Q&A source: ${error?.message}`);
    }

    return source as TrainingSource;
  }

  async deleteSource(
    sourceId: string,
    organizationId: string,
  ): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { data: source, error: fetchError } = await supabase
      .from('training_sources')
      .select('*')
      .eq('id', sourceId)
      .eq('organizationId', organizationId)
      .single();

    if (fetchError || !source) {
      throw new NotFoundException('Training source not found');
    }

    // Delete file if it exists
    if (source.metadata?.storageUrl) {
      try {
        await fs.unlink(source.metadata.storageUrl);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    const { error: deleteError } = await supabase
      .from('training_sources')
      .delete()
      .eq('id', sourceId);

    if (deleteError) {
      throw new Error(`Failed to delete source: ${deleteError.message}`);
    }
  }

  async triggerTraining(
    widgetId: string,
    organizationId: string,
  ): Promise<TrainingJob> {
    const sources = await this.findAllByWidget(widgetId, organizationId);
    const supabase = this.supabaseService.getClient();

    const { data: job, error } = await supabase
      .from('training_jobs')
      .insert({
        organizationId,
        widgetId,
        status: 'queued',
        progress: 0,
        totalItems: sources.length,
        processedItems: 0,
        startedAt: Date.now(),
      })
      .select()
      .single();

    if (error || !job) {
      throw new Error(`Failed to create training job: ${error?.message}`);
    }

    // Mock training process
    this.mockTrainingJob(job.id, sources.length);

    return job as TrainingJob;
  }

  async getTrainingStatus(
    widgetId: string,
    organizationId: string,
  ): Promise<TrainingJob | null> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('training_jobs')
      .select('*')
      .eq('widgetId', widgetId)
      .eq('organizationId', organizationId)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return null;
    }

    return data as TrainingJob;
  }

  // Mock processing methods

  private async mockProcessUrlSource(sourceId: string) {
    const supabase = this.supabaseService.getClient();

    // Simulate 2-3 second processing delay
    setTimeout(async () => {
      await supabase
        .from('training_sources')
        .update({ status: 'processing' })
        .eq('id', sourceId);

      // Simulate crawling completion
      setTimeout(async () => {
        const mockChunks = Math.floor(Math.random() * 6) + 5; // 5-10 chunks
        await supabase
          .from('training_sources')
          .update({ status: 'completed', totalChunks: mockChunks })
          .eq('id', sourceId);
      }, 2000);
    }, 1000);
  }

  private async mockProcessFileSource(sourceId: string, fileSize: number) {
    const supabase = this.supabaseService.getClient();

    setTimeout(async () => {
      await supabase
        .from('training_sources')
        .update({ status: 'processing' })
        .eq('id', sourceId);

      setTimeout(async () => {
        // Mock: 1 chunk per 10KB
        const mockChunks = Math.max(1, Math.floor(fileSize / 10240));
        await supabase
          .from('training_sources')
          .update({ status: 'completed', totalChunks: mockChunks })
          .eq('id', sourceId);
      }, 3000);
    }, 1000);
  }

  private async mockTrainingJob(jobId: string, totalItems: number) {
    const supabase = this.supabaseService.getClient();

    setTimeout(async () => {
      await supabase
        .from('training_jobs')
        .update({ status: 'processing' })
        .eq('id', jobId);

      // Simulate progress updates
      const progressInterval = setInterval(async () => {
        const { data: currentJob } = await supabase
          .from('training_jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (currentJob && currentJob.status === 'processing') {
          const processedItems = Math.min(
            (currentJob.processedItems || 0) + 1,
            totalItems,
          );
          const progress = Math.round((processedItems / totalItems) * 100);

          if (processedItems >= totalItems) {
            await supabase
              .from('training_jobs')
              .update({
                processedItems,
                progress,
                status: 'completed',
                completedAt: Date.now(),
              })
              .eq('id', jobId);
            clearInterval(progressInterval);
          } else {
            await supabase
              .from('training_jobs')
              .update({ processedItems, progress })
              .eq('id', jobId);
          }
        } else {
          clearInterval(progressInterval);
        }
      }, 1000); // Update every second
    }, 500);
  }
}
