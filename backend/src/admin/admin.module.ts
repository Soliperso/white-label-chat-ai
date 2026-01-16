import { Module } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { AuditLogService } from './services/audit-log.service';
import { AdminOrganizationsService } from './services/admin-organizations.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdminAnalyticsService } from './services/admin-analytics.service';
import { AdminOrganizationsController } from './controllers/admin-organizations.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminAnalyticsController } from './controllers/admin-analytics.controller';
import { AdminAuditController } from './controllers/admin-audit.controller';

/**
 * AdminModule provides platform-level administration functionality
 * for super admin users. All routes are protected with @IsSuperAdmin()
 * and all actions are logged to audit_logs.
 */
@Module({
  controllers: [
    AdminOrganizationsController,
    AdminUsersController,
    AdminAnalyticsController,
    AdminAuditController,
  ],
  providers: [
    SupabaseService,
    AuditLogService,
    AdminOrganizationsService,
    AdminUsersService,
    AdminAnalyticsService,
  ],
  exports: [AuditLogService],
})
export class AdminModule {}
