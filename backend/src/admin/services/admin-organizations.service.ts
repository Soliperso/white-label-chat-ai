import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../auth/supabase.service';
import { AuditLogService } from './audit-log.service';
import { User } from '../../auth/strategies/supabase-jwt.strategy';

/**
 * AdminOrganizationsService provides platform-wide organization management
 * for super admin users. All operations bypass tenant filtering and are audited.
 */
@Injectable()
export class AdminOrganizationsService {
  private readonly logger = new Logger(AdminOrganizationsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Get all organizations with optional filters and pagination
   * Super admins can see ALL organizations across the platform
   */
  async getAllOrganizations(
    user: User,
    filters: {
      search?: string;
      isActive?: boolean;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('organizations')
      .select('*, users(count)', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    // Apply pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Failed to fetch organizations', error);
      throw new Error(`Failed to fetch organizations: ${error.message}`);
    }

    // Log the action
    await this.auditLogService.logAction({
      superAdminId: user.id,
      actionType: 'view',
      targetResourceType: 'organization',
      metadata: {
        action: 'list_all_organizations',
        filters,
        resultCount: data?.length || 0,
      },
    });

    return {
      data: data || [],
      total: count || 0,
      limit,
      offset,
    };
  }

  /**
   * Get detailed information about a specific organization
   */
  async getOrganizationDetails(user: User, organizationId: string) {
    const supabase = this.supabaseService.getClient();

    // Get organization with related data
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select(`
        *,
        users(count),
        training_sources(count),
        training_jobs(count)
      `)
      .eq('id', organizationId)
      .single();

    if (orgError || !org) {
      throw new NotFoundException(`Organization ${organizationId} not found`);
    }

    // Get recent users
    const { data: recentUsers } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Log the action
    await this.auditLogService.logAction({
      superAdminId: user.id,
      actionType: 'view',
      targetOrganizationId: organizationId,
      targetResourceType: 'organization',
      targetResourceId: organizationId,
      metadata: {
        action: 'view_organization_details',
      },
    });

    return {
      organization: org,
      recentUsers: recentUsers || [],
    };
  }

  /**
   * Create a new organization (super admin only)
   */
  async createOrganization(
    user: User,
    data: {
      name: string;
      slug: string;
      logoUrl?: string;
      primaryColor?: string;
      isWhiteLabeled?: boolean;
    },
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: org, error } = await supabase
      .from('organizations')
      .insert({
        name: data.name,
        slug: data.slug,
        logo_url: data.logoUrl,
        primary_color: data.primaryColor,
        is_white_labeled: data.isWhiteLabeled || false,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to create organization', error);
      throw new Error(`Failed to create organization: ${error.message}`);
    }

    // Log the action
    await this.auditLogService.logAction({
      superAdminId: user.id,
      actionType: 'create',
      targetOrganizationId: org.id,
      targetResourceType: 'organization',
      targetResourceId: org.id,
      metadata: {
        action: 'create_organization',
        organizationData: data,
      },
    });

    return org;
  }

  /**
   * Update an organization
   */
  async updateOrganization(
    user: User,
    organizationId: string,
    data: {
      name?: string;
      slug?: string;
      logoUrl?: string;
      primaryColor?: string;
      isWhiteLabeled?: boolean;
      isActive?: boolean;
    },
  ) {
    const supabase = this.supabaseService.getClient();

    // Get original data for audit
    const { data: original } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (!original) {
      throw new NotFoundException(`Organization ${organizationId} not found`);
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.logoUrl !== undefined) updateData.logo_url = data.logoUrl;
    if (data.primaryColor !== undefined) updateData.primary_color = data.primaryColor;
    if (data.isWhiteLabeled !== undefined) updateData.is_white_labeled = data.isWhiteLabeled;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    const { data: updated, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', organizationId)
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to update organization', error);
      throw new Error(`Failed to update organization: ${error.message}`);
    }

    // Log the action
    await this.auditLogService.logAction({
      superAdminId: user.id,
      actionType: 'update',
      targetOrganizationId: organizationId,
      targetResourceType: 'organization',
      targetResourceId: organizationId,
      metadata: {
        action: 'update_organization',
        before: original,
        after: updated,
        changes: data,
      },
    });

    return updated;
  }

  /**
   * Suspend an organization (soft delete)
   */
  async suspendOrganization(user: User, organizationId: string) {
    return this.updateOrganization(user, organizationId, { isActive: false });
  }

  /**
   * Activate a suspended organization
   */
  async activateOrganization(user: User, organizationId: string) {
    return this.updateOrganization(user, organizationId, { isActive: true });
  }

  /**
   * Get platform-wide organization statistics
   */
  async getOrganizationStats(user: User) {
    const supabase = this.supabaseService.getClient();

    // Total organizations
    const { count: totalOrgs } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true });

    // Active organizations
    const { count: activeOrgs } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Organizations created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newThisMonth } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // Log the action
    await this.auditLogService.logAction({
      superAdminId: user.id,
      actionType: 'view',
      targetResourceType: 'organization',
      metadata: {
        action: 'view_organization_stats',
      },
    });

    return {
      total: totalOrgs || 0,
      active: activeOrgs || 0,
      suspended: (totalOrgs || 0) - (activeOrgs || 0),
      newThisMonth: newThisMonth || 0,
    };
  }
}
