import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingSource } from './entities/training-source.entity';
import { TrainingJob } from './entities/training-job.entity';
import { CreateTrainingSourceDto } from './dto/create-training-source.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(TrainingSource)
    private trainingSourceRepository: Repository<TrainingSource>,
    @InjectRepository(TrainingJob)
    private trainingJobRepository: Repository<TrainingJob>,
  ) {}

  async findAllByWidget(
    widgetId: string,
    organizationId: string,
  ): Promise<TrainingSource[]> {
    return this.trainingSourceRepository.find({
      where: {
        widgetId,
        organizationId,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async createUrlSource(
    widgetId: string,
    organizationId: string,
    dto: CreateTrainingSourceDto,
  ): Promise<TrainingSource> {
    const source = this.trainingSourceRepository.create({
      organizationId,
      widgetId,
      sourceType: 'url',
      metadata: {
        url: dto.url,
        crawlDepth: dto.crawlDepth || 1,
      },
      status: 'pending',
    });

    const saved = await this.trainingSourceRepository.save(source);

    // Mock processing - simulate crawling
    this.mockProcessUrlSource(saved.id);

    return saved;
  }

  async createFileSource(
    widgetId: string,
    organizationId: string,
    file: Express.Multer.File,
  ): Promise<TrainingSource> {
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

    const source = this.trainingSourceRepository.create({
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
    });

    const saved = await this.trainingSourceRepository.save(source);

    // Mock processing
    this.mockProcessFileSource(saved.id, file.size);

    return saved;
  }

  async createQASource(
    widgetId: string,
    organizationId: string,
    dto: CreateTrainingSourceDto,
  ): Promise<TrainingSource> {
    const source = this.trainingSourceRepository.create({
      organizationId,
      widgetId,
      sourceType: 'qna',
      metadata: {
        question: dto.question,
        answer: dto.answer,
      },
      status: 'completed', // Q&A pairs are immediately ready
      totalChunks: 1,
    });

    return this.trainingSourceRepository.save(source);
  }

  async deleteSource(
    sourceId: string,
    organizationId: string,
  ): Promise<void> {
    const source = await this.trainingSourceRepository.findOne({
      where: {
        id: sourceId,
        organizationId,
      },
    });

    if (!source) {
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

    await this.trainingSourceRepository.remove(source);
  }

  async triggerTraining(
    widgetId: string,
    organizationId: string,
  ): Promise<TrainingJob> {
    const sources = await this.findAllByWidget(widgetId, organizationId);

    const job = this.trainingJobRepository.create({
      organizationId,
      widgetId,
      status: 'queued',
      progress: 0,
      totalItems: sources.length,
      processedItems: 0,
      startedAt: Date.now(),
    });

    const saved = await this.trainingJobRepository.save(job);

    // Mock training process
    this.mockTrainingJob(saved.id, sources.length);

    return saved;
  }

  async getTrainingStatus(
    widgetId: string,
    organizationId: string,
  ): Promise<TrainingJob | null> {
    return this.trainingJobRepository.findOne({
      where: {
        widgetId,
        organizationId,
      },
      order: { createdAt: 'DESC' },
    });
  }

  // Mock processing methods

  private async mockProcessUrlSource(sourceId: string) {
    // Simulate 2-3 second processing delay
    setTimeout(async () => {
      const source = await this.trainingSourceRepository.findOne({
        where: { id: sourceId },
      });

      if (source) {
        source.status = 'processing';
        await this.trainingSourceRepository.save(source);

        // Simulate crawling completion
        setTimeout(async () => {
          const updatedSource = await this.trainingSourceRepository.findOne({
            where: { id: sourceId },
          });

          if (updatedSource) {
            const mockChunks = Math.floor(Math.random() * 6) + 5; // 5-10 chunks
            updatedSource.status = 'completed';
            updatedSource.totalChunks = mockChunks;
            await this.trainingSourceRepository.save(updatedSource);
          }
        }, 2000);
      }
    }, 1000);
  }

  private async mockProcessFileSource(sourceId: string, fileSize: number) {
    setTimeout(async () => {
      const source = await this.trainingSourceRepository.findOne({
        where: { id: sourceId },
      });

      if (source) {
        source.status = 'processing';
        await this.trainingSourceRepository.save(source);

        setTimeout(async () => {
          const updatedSource = await this.trainingSourceRepository.findOne({
            where: { id: sourceId },
          });

          if (updatedSource) {
            // Mock: 1 chunk per 10KB
            const mockChunks = Math.max(1, Math.floor(fileSize / 10240));
            updatedSource.status = 'completed';
            updatedSource.totalChunks = mockChunks;
            await this.trainingSourceRepository.save(updatedSource);
          }
        }, 3000);
      }
    }, 1000);
  }

  private async mockTrainingJob(jobId: string, totalItems: number) {
    setTimeout(async () => {
      const job = await this.trainingJobRepository.findOne({
        where: { id: jobId },
      });

      if (job) {
        job.status = 'processing';
        await this.trainingJobRepository.save(job);

        // Simulate progress updates
        const progressInterval = setInterval(async () => {
          const currentJob = await this.trainingJobRepository.findOne({
            where: { id: jobId },
          });

          if (currentJob && currentJob.status === 'processing') {
            currentJob.processedItems = Math.min(
              currentJob.processedItems + 1,
              totalItems,
            );
            currentJob.progress = Math.round(
              (currentJob.processedItems / totalItems) * 100,
            );

            if (currentJob.processedItems >= totalItems) {
              currentJob.status = 'completed';
              currentJob.completedAt = Date.now();
              clearInterval(progressInterval);
            }

            await this.trainingJobRepository.save(currentJob);
          } else {
            clearInterval(progressInterval);
          }
        }, 1000); // Update every second
      }
    }, 500);
  }
}
