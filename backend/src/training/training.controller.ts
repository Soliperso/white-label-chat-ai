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
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get('widgets/:widgetId/training/sources')
  @Roles('admin', 'manager', 'viewer')
  async getTrainingSources(
    @Param('widgetId') widgetId: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const sources = await this.trainingService.findAllByWidget(
      widgetId,
      organizationId,
    );
    return { sources };
  }

  @Post('widgets/:widgetId/training/sources/url')
  @Roles('admin', 'manager')
  async addUrlSource(
    @Param('widgetId') widgetId: string,
    @Body() dto: CreateTrainingSourceDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const source = await this.trainingService.createUrlSource(
      widgetId,
      organizationId,
      dto,
    );
    return { source };
  }

  @Post('widgets/:widgetId/training/sources/file')
  @Roles('admin', 'manager')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('widgetId') widgetId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const source = await this.trainingService.createFileSource(
      widgetId,
      organizationId,
      file,
    );
    return { source };
  }

  @Post('widgets/:widgetId/training/sources/qna')
  @Roles('admin', 'manager')
  async addQASource(
    @Param('widgetId') widgetId: string,
    @Body() dto: CreateTrainingSourceDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const source = await this.trainingService.createQASource(
      widgetId,
      organizationId,
      dto,
    );
    return { source };
  }

  @Delete('training/sources/:sourceId')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSource(
    @Param('sourceId') sourceId: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    await this.trainingService.deleteSource(sourceId, organizationId);
  }

  @Post('widgets/:widgetId/training/trigger')
  @Roles('admin', 'manager')
  async triggerTraining(
    @Param('widgetId') widgetId: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const job = await this.trainingService.triggerTraining(
      widgetId,
      organizationId,
    );
    return { job };
  }

  @Get('widgets/:widgetId/training/status')
  @Roles('admin', 'manager', 'viewer')
  async getTrainingStatus(
    @Param('widgetId') widgetId: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const job = await this.trainingService.getTrainingStatus(
      widgetId,
      organizationId,
    );
    return { job };
  }
}
