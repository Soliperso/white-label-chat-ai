import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogService } from '../services/audit-log.service';
import { SupabaseJwtGuard } from '../../auth/guards/supabase-jwt.guard';
import { SuperAdminGuard } from '../../auth/guards/super-admin.guard';
import { IsSuperAdmin } from '../../auth/decorators/is-super-admin.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../auth/strategies/supabase-jwt.strategy';
import { ListAuditLogsQueryDto } from '../dto/query-params.dto';

/**
 * AdminAuditController provides access to audit logs
 * All routes are super admin only
 */
@ApiTags('Admin - Audit Logs')
@ApiBearerAuth()
@Controller('admin/audit-logs')
@UseGuards(SupabaseJwtGuard, SuperAdminGuard)
export class AdminAuditController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @IsSuperAdmin()
  @ApiOperation({ summary: 'Get audit logs with filters' })
  @ApiResponse({ status: 200, description: 'Returns paginated audit logs' })
  @ApiResponse({ status: 403, description: 'Access denied - super admin only' })
  async getAuditLogs(
    @CurrentUser() user: User,
    @Query() query: ListAuditLogsQueryDto,
  ) {
    return this.auditLogService.getAuditLogs(query);
  }

  @Get('export')
  @IsSuperAdmin()
  @ApiOperation({ summary: 'Export audit logs to CSV' })
  @ApiResponse({ status: 200, description: 'Returns audit logs as CSV', type: String })
  @HttpCode(HttpStatus.OK)
  async exportAuditLogs(
    @CurrentUser() user: User,
    @Query() query: ListAuditLogsQueryDto,
  ) {
    return this.auditLogService.exportAuditLogs({
      startDate: query.startDate,
      endDate: query.endDate,
      actionType: query.actionType,
    });
  }
}
