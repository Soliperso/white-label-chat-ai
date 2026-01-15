import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WidgetsService } from './widgets.service';
import { CreateWidgetDto, UpdateWidgetDto } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('widgets')
@ApiBearerAuth()
@Controller('widgets')
export class WidgetsController {
  constructor(private readonly widgetsService: WidgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new widget' })
  @ApiResponse({
    status: 201,
    description: 'Widget created successfully',
  })
  async create(
    @Body() createWidgetDto: CreateWidgetDto,
    @CurrentUser() user: User,
  ) {
    const widget = await this.widgetsService.create(
      createWidgetDto,
      user.organizationId,
    );

    return {
      widget,
      message: 'Widget created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all widgets for the organization' })
  @ApiResponse({
    status: 200,
    description: 'List of widgets',
  })
  async findAll(@CurrentUser() user: User) {
    const widgets = await this.widgetsService.findAll(user.organizationId);

    return {
      widgets,
      count: widgets.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single widget by ID' })
  @ApiResponse({
    status: 200,
    description: 'Widget details',
  })
  @ApiResponse({
    status: 404,
    description: 'Widget not found',
  })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const widget = await this.widgetsService.findOne(id, user.organizationId);

    return {
      widget,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a widget' })
  @ApiResponse({
    status: 200,
    description: 'Widget updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Widget not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateWidgetDto: UpdateWidgetDto,
    @CurrentUser() user: User,
  ) {
    const widget = await this.widgetsService.update(
      id,
      updateWidgetDto,
      user.organizationId,
    );

    return {
      widget,
      message: 'Widget updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a widget' })
  @ApiResponse({
    status: 204,
    description: 'Widget deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Widget not found',
  })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.widgetsService.remove(id, user.organizationId);
  }
}
