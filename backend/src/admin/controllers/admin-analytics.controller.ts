import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminAnalyticsService } from '../services/admin-analytics.service';
import { SupabaseJwtGuard } from '../../auth/guards/supabase-jwt.guard';
import { SuperAdminGuard } from '../../auth/guards/super-admin.guard';
import { IsSuperAdmin } from '../../auth/decorators/is-super-admin.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../auth/strategies/supabase-jwt.strategy';
import { Type } from 'class-transformer';
import { IsOptional, IsEnum } from 'class-validator';

/**
 * Query DTO for date range
 */
class DateRangeQueryDto {
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  endDate?: Date;
}

/**
 * Query DTO for export format
 */
class ExportFormatQueryDto {
  @IsOptional()
  @IsEnum(['json', 'csv'])
  format?: 'json' | 'csv' = 'json';
}

/**
 * AdminAnalyticsController provides platform-wide analytics and reporting
 * All routes are super admin only and all actions are audited
 */
@ApiTags('Admin - Analytics')
@ApiBearerAuth()
@Controller('admin/analytics')
@UseGuards(SupabaseJwtGuard, SuperAdminGuard)
export class AdminAnalyticsController {
  constructor(private readonly adminAnalyticsService: AdminAnalyticsService) {}

  @Get('platform')
  @IsSuperAdmin()
  @ApiOperation({ summary: 'Get platform-wide statistics' })
  @ApiResponse({ status: 200, description: 'Returns platform statistics dashboard' })
  async getPlatformStats(@CurrentUser() user: User) {
    return this.adminAnalyticsService.getPlatformStats(user);
  }

  @Get('growth')
  @IsSuperAdmin()
  @ApiOperation({ summary: 'Get growth metrics over time' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiResponse({ status: 200, description: 'Returns growth metrics for the specified date range' })
  async getGrowthMetrics(
    @CurrentUser() user: User,
    @Query() query: DateRangeQueryDto,
  ) {
    const now = new Date();
    const startDate = query.startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = query.endDate || now;

    return this.adminAnalyticsService.getGrowthMetrics(user, {
      startDate,
      endDate,
    });
  }

  @Get('usage')
  @IsSuperAdmin()
  @ApiOperation({ summary: 'Get usage metrics (placeholder)' })
  @ApiResponse({ status: 200, description: 'Returns usage metrics (to be implemented with chat features)' })
  async getUsageMetrics(@CurrentUser() user: User) {
    return this.adminAnalyticsService.getUsageMetrics(user);
  }

  @Get('export')
  @IsSuperAdmin()
  @ApiOperation({ summary: 'Export platform report' })
  @ApiQuery({ name: 'format', enum: ['json', 'csv'], required: false })
  @ApiResponse({ status: 200, description: 'Returns platform report in requested format' })
  async exportPlatformReport(
    @CurrentUser() user: User,
    @Query() query: ExportFormatQueryDto,
  ) {
    const result = await this.adminAnalyticsService.exportPlatformReport(
      user,
      query.format,
    );

    if (result.format === 'csv') {
      return result.data;
    }

    return result;
  }
}
