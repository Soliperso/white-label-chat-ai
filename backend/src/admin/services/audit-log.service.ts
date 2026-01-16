import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../auth/supabase.service';

/**
 * Interface for logging super admin actions
 */
export interface AuditLogEntry {
  superAdminId: string;
  actionType: 'view' | 'create' | 'update' | 'delete' | 'impersonate' | 'export';
  targetOrganizationId?: string;
  targetResourceType?: 'user' | 'organization' | 'widget' | 'training_source' | 'training_job';
  targetResourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * AuditLogService handles logging of all super admin actions
 * for compliance, security, and debugging purposes.
 *
 * All platform-level operations should be logged through this service.
 */
@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Log a super admin action to the audit_logs table
   */
  async logAction(entry: AuditLogEntry): Promise<void> {
    try {
      const supabase = this.supabaseService.getClient();

      const { error } = await supabase.from('audit_logs').insert({
        super_admin_id: entry.superAdminId,
        action_type: entry.actionType,
        target_organization_id: entry.targetOrganizationId || null,
        target_resource_type: entry.targetResourceType || null,
        target_resource_id: entry.targetResourceId || null,
        metadata: entry.metadata || {},
        ip_address: entry.ipAddress || null,
        user_agent: entry.userAgent || null,
      });

      if (error) {
        this.logger.error(`Failed to log audit entry: ${error.message}`, {
          entry,
          error,
        });
      } else {
        this.logger.log(
          `Audit log: ${entry.superAdminId} performed ${entry.actionType} on ${entry.targetResourceType || 'platform'}`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to log audit entry', error);
    }
  }

  /**
   * Get audit logs with filters and pagination
   */
  async getAuditLogs(filters: {
    superAdminId?: string;
    actionType?: string;
    targetOrganizationId?: string;
    targetResourceType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('audit_logs')
      .select('*, super_admin:users!super_admin_id(*)')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.superAdminId) {
      query = query.eq('super_admin_id', filters.superAdminId);
    }
    if (filters.actionType) {
      query = query.eq('action_type', filters.actionType);
    }
    if (filters.targetOrganizationId) {
      query = query.eq('target_organization_id', filters.targetOrganizationId);
    }
    if (filters.targetResourceType) {
      query = query.eq('target_resource_type', filters.targetResourceType);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    // Apply pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Failed to fetch audit logs', error);
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }

    return {
      data: data || [],
      total: count || 0,
      limit,
      offset,
    };
  }

  /**
   * Export audit logs to CSV format
   */
  async exportAuditLogs(filters: {
    startDate?: Date;
    endDate?: Date;
    actionType?: string;
  }): Promise<string> {
    const logs = await this.getAuditLogs({
      ...filters,
      limit: 10000, // Large limit for export
    });

    // CSV header
    const header = [
      'Timestamp',
      'Super Admin',
      'Action Type',
      'Resource Type',
      'Resource ID',
      'Organization ID',
      'IP Address',
      'Metadata',
    ];

    // CSV rows
    const rows = logs.data.map((log: any) => [
      log.created_at,
      log.super_admin?.email || log.super_admin_id,
      log.action_type,
      log.target_resource_type || '',
      log.target_resource_id || '',
      log.target_organization_id || '',
      log.ip_address || '',
      JSON.stringify(log.metadata || {}),
    ]);

    // Build CSV
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    return csv;
  }
}
