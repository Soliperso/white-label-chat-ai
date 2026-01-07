import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TrainingService } from './training.service';
import { CreateTrainingSourceDto } from './dto/create-training-source.dto';

@Controller('api')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get('widgets/:widgetId/training/sources')
  async getTrainingSources(@Param('widgetId') widgetId: string) {
    // TODO: Extract organizationId from JWT in future
    const organizationId = 'temp-org-id';
    const sources = await this.trainingService.findAllByWidget(
      widgetId,
      organizationId,
    );
    return { sources };
  }

  @Post('widgets/:widgetId/training/sources/url')
  async addUrlSource(
    @Param('widgetId') widgetId: string,
    @Body() dto: CreateTrainingSourceDto,
  ) {
    const organizationId = 'temp-org-id';
    const source = await this.trainingService.createUrlSource(
      widgetId,
      organizationId,
      dto,
    );
    return { source };
  }

  @Post('widgets/:widgetId/training/sources/file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('widgetId') widgetId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const organizationId = 'temp-org-id';
    const source = await this.trainingService.createFileSource(
      widgetId,
      organizationId,
      file,
    );
    return { source };
  }

  @Post('widgets/:widgetId/training/sources/qna')
  async addQASource(
    @Param('widgetId') widgetId: string,
    @Body() dto: CreateTrainingSourceDto,
  ) {
    const organizationId = 'temp-org-id';
    const source = await this.trainingService.createQASource(
      widgetId,
      organizationId,
      dto,
    );
    return { source };
  }

  @Delete('training/sources/:sourceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSource(@Param('sourceId') sourceId: string) {
    const organizationId = 'temp-org-id';
    await this.trainingService.deleteSource(sourceId, organizationId);
  }

  @Post('widgets/:widgetId/training/trigger')
  async triggerTraining(@Param('widgetId') widgetId: string) {
    const organizationId = 'temp-org-id';
    const job = await this.trainingService.triggerTraining(
      widgetId,
      organizationId,
    );
    return { job };
  }

  @Get('widgets/:widgetId/training/status')
  async getTrainingStatus(@Param('widgetId') widgetId: string) {
    const organizationId = 'temp-org-id';
    const job = await this.trainingService.getTrainingStatus(
      widgetId,
      organizationId,
    );
    return { job };
  }
}
