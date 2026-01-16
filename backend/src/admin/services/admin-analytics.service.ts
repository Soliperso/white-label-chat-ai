import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../auth/supabase.service';
import { AuditLogService } from './audit-log.service';
import { User } from '../../auth/strategies/supabase-jwt.strategy';

/**
 * AdminAnalyticsService provides platform-wide analytics and metrics
 * for super admin users.
 */
@Injectable()
export class AdminAnalyticsService {
  private readonly logger = new Logger(AdminAnalyticsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Get platform-wide statistics dashboard
   */
  async getPlatformStats(user: User) {
    const supabase = this.supabaseService.getClient();

    // Organizations
    const { count: totalOrgs } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true });

    const { count: activeOrgs } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Training Sources
    const { count: totalTrainingSources } = await supabase
      .from('training_sources')
      .select('*', { count: 'exact', head: true });

    // Training Jobs
    const { count: totalTrainingJobs } = await supabase
      .from('training_jobs')
      .select('*', { count: 'exact', head: true });

    const { count: runningJobs } = await supabase
      .from('training_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'running');

    // Log the action
    await this.auditLogService.logAction({
      superAdminId: user.id,
      actionType: 'view',
      metadata: {
        action: 'view_platform_stats',
      },
    });

    return {
      organizations: {
        total: totalOrgs || 0,
        active: activeOrgs || 0,
        suspended: (totalOrgs || 0) - (activeOrgs || 0),
      },
      users: {
        total: totalUsers || 0,
        active: activeUsers || 0,
        suspended: (totalUsers || 0) - (activeUsers || 0),
      },
      training: {
        sources: totalTrainingSources || 0,
        jobs: totalTrainingJobs || 0,
        runningJobs: runningJobs || 0,
      },
    };
  }

  /**
   * Get growth metrics over time
   */
  async getGrowthMetrics(
    user: User,
    dateRange: { startDate: Date; endDate: Date },
  ) {
    const supabase = this.supabaseService.getClient();

    // Organizations growth
    const { count: newOrgs } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateRange.startDate.toISOString())
      .lte('created_at', dateRange.endDate.toISOString());

    // Users growth
    const { count: newUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateRange.startDate.toISOString())
      .lte('created_at', dateRange.endDate.toISOString());

    // Training sources added
    const { count: newSources } = await supabase
      .from('training_sources')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateRange.startDate.toISOString())
      .lte('created_at', dateRange.endDate.toISOString());

    // Log the action
    await this.auditLogService.logAction({
      superAdminId: user.id,
      actionType: 'view',
      metadata: {
        action: 'view_growth_metrics',
        dateRange,
      },
    });

    return {
      dateRange,
      newOrganizations: newOrgs || 0,
      newUsers: newUsers || 0,
      newTrainingSources: newSources || 0,
    };
  }

  /**
   * Get usage metrics (placeholder for future implementation)
   */
  async getUsageMetrics(user: User) {
    // TODO: Implement when conversation/message tracking is added
    // This will track:
    // - Total messages sent
    // - API calls made
    // - Storage used
    // - Token usage
    // - Active conversations

    await this.auditLogService.logAction({
      superAdminId: user.id,
      actionType: 'view',
      metadata: {
        action: 'view_usage_metrics',
      },
    });

    return {
      message: 'Usage metrics will be available when chat functionality is implemented',
      placeholder: {
        totalMessages: 0,
        apiCalls: 0,
        storageUsedMB: 0,
        tokensUsed: 0,
      },
    };
  }

  /**
   * Export platform report
   */
  async exportPlatformReport(
    user: User,
    format: 'json' | 'csv' = 'json',
  ): Promise<any> {
    const stats = await this.getPlatformStats(user);

    const supabase = this.supabaseService.getClient();

    // Get all organizations with details
    const { data: organizations } = await supabase
      .from('organizations')
      .select('id, name, slug, is_active, created_at')
      .order('created_at', { ascending: false });

    // Get user counts per organization
    const orgsWithUserCounts = await Promise.all(
      (organizations || []).map(async (org) => {
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', org.id);

        return {
          ...org,
          userCount: count || 0,
        };
      }),
    );

    // Log the action
    await this.auditLogService.logAction({
      superAdminId: user.id,
      actionType: 'export',
      metadata: {
        action: 'export_platform_report',
        format,
      },
    });

    const report = {
      generatedAt: new Date().toISOString(),
      generatedBy: user.email,
      summary: stats,
      organizations: orgsWithUserCounts,
    };

    if (format === 'csv') {
      // Convert to CSV
      const header = ['Organization', 'Slug', 'Active', 'Users', 'Created At'];
      const rows = orgsWithUserCounts.map((org) => [
        org.name,
        org.slug,
        org.is_active ? 'Yes' : 'No',
        org.userCount.toString(),
        org.created_at,
      ]);

      const csv = [header, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      return {
        format: 'csv',
        data: csv,
        filename: `platform-report-${new Date().toISOString().split('T')[0]}.csv`,
      };
    }

    return {
      format: 'json',
      data: report,
      filename: `platform-report-${new Date().toISOString().split('T')[0]}.json`,
    };
  }
}
