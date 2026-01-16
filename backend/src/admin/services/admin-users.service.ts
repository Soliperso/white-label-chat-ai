import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../auth/supabase.service';
import { AuditLogService } from './audit-log.service';
import { User } from '../../auth/strategies/supabase-jwt.strategy';

/**
 * AdminUsersService provides platform-wide user management
 * for super admin users. Includes impersonation functionality.
 */
@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Get all users across all organizations with filters and pagination
   */
  async getAllUsers(
    user: User,
    filters: {
      search?: string;
      role?: string;
      organizationId?: string;
      isActive?: boolean;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('users')
      .select('*, organization:organizations(id, name)', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.search) {
      query = query.or(`email.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`);
    }
    if (filters.role) {
      query = query.eq('role', filters.role);
    }
    if (filters.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
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
      this.logger.error('Failed to fetch users', error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    // Log the action
    await this.auditLogService.logAction({
      superAdminId: user.id,
      actionType: 'view',
      targetResourceType: 'user',
      metadata: {
        action: 'list_all_users',
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
   * Get detailed information about a specific user
   */
  async getUserDetails(user: User, userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: targetUser, error } = await supabase
      .from('users')
      .select('*, organization:organizations(*)')
      .eq('id', userId)
      .single();

    if (error || !targetUser) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    // Log the action
    await this.auditLogService.logAction({
      superAdminId: user.id,
      actionType: 'view',
      targetOrganizationId: targetUser.organization_id,
      targetResourceType: 'user',
      targetResourceId: userId,
      metadata: {
        action: 'view_user_details',
        targetUserEmail: targetUser.email,
      },
    });

    return targetUser;
  }

  /**
   * Update a user's information
   */
  async updateUser(
    user: User,
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      role?: 'admin' | 'manager' | 'viewer' | 'super_admin';
      isActive?: boolean;
      profilePictureUrl?: string;
    },
  ) {
    const supabase = this.supabaseService.getClient();

    // Prevent non-super-admins from setting super_admin role
    // (This is also enforced by RLS, but double-check here)
    if (data.role === 'super_admin' && user.role !== 'super_admin') {
      throw new BadRequestException('Only super admins can promote users to super_admin');
    }

    // Prevent super admin from demoting themselves
    if (userId === user.id && data.role && data.role !== 'super_admin') {
      throw new BadRequestException('Cannot change your own super admin role');
    }

    // Get original data for audit
    const { data: original } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!original) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const updateData: any = {};
    if (data.firstName !== undefined) updateData.first_name = data.firstName;
    if (data.lastName !== undefined) updateData.last_name = data.lastName;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.profilePictureUrl !== undefined) updateData.profile_picture_url = data.profilePictureUrl;

    const { data: updated, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to update user', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    // Log the action
    await this.auditLogService.logAction({
      superAdminId: user.id,
      actionType: 'update',
      targetOrganizationId: original.organization_id,
      targetResourceType: 'user',
      targetResourceId: userId,
      metadata: {
        action: 'update_user',
        targetUserEmail: original.email,
        before: original,
        after: updated,
        changes: data,
      },
    });

    return updated;
  }

  /**
   * Suspend a user account
   */
  async suspendUser(user: User, userId: string) {
    // Prevent super admin from suspending themselves
    if (userId === user.id) {
      throw new BadRequestException('Cannot suspend your own account');
    }

    return this.updateUser(user, userId, { isActive: false });
  }

  /**
   * Activate a suspended user account
   */
  async activateUser(user: User, userId: string) {
    return this.updateUser(user, userId, { isActive: true });
  }

  /**
   * Promote a user to super admin
   * SECURITY CRITICAL: Only super admins can do this
   */
  async promoteToSuperAdmin(user: User, userId: string) {
    const supabase = this.supabaseService.getClient();

    // Get target user info
    const { data: targetUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!targetUser) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    if (targetUser.role === 'super_admin') {
      throw new BadRequestException('User is already a super admin');
    }

    // Update user role to super_admin and clear organization_id
    const { data: updated, error } = await supabase
      .from('users')
      .update({
        role: 'super_admin',
        organization_id: null, // Super admins have no organization
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to promote user to super admin', error);
      throw new Error(`Failed to promote user: ${error.message}`);
    }

    // Log this critical action
    await this.auditLogService.logAction({
      superAdminId: user.id,
      actionType: 'update',
      targetOrganizationId: targetUser.organization_id,
      targetResourceType: 'user',
      targetResourceId: userId,
      metadata: {
        action: 'promote_to_super_admin',
        targetUserEmail: targetUser.email,
        previousRole: targetUser.role,
        previousOrganizationId: targetUser.organization_id,
      },
    });

    this.logger.warn(
      `SECURITY: User ${targetUser.email} (${userId}) promoted to super_admin by ${user.email} (${user.id})`,
    );

    return updated;
  }

  /**
   * Get platform-wide user statistics
   */
  async getUserStats(user: User) {
    const supabase = this.supabaseService.getClient();

    // Total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Active users
    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Users by role
    const { data: roleData } = await supabase
      .from('users')
      .select('role')
      .not('role', 'is', null);

    const roleBreakdown = (roleData || []).reduce((acc: any, u: any) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    // Users created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newThisMonth } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // Log the action
    await this.auditLogService.logAction({
      superAdminId: user.id,
      actionType: 'view',
      targetResourceType: 'user',
      metadata: {
        action: 'view_user_stats',
      },
    });

    return {
      total: totalUsers || 0,
      active: activeUsers || 0,
      suspended: (totalUsers || 0) - (activeUsers || 0),
      roleBreakdown,
      newThisMonth: newThisMonth || 0,
    };
  }

  /**
   * TODO: Implement user impersonation in Phase 4
   * This will generate a special JWT token that allows the super admin
   * to act as another user while maintaining audit trail
   */
  async impersonateUser(user: User, targetUserId: string): Promise<any> {
    throw new Error('User impersonation not yet implemented - coming in Phase 4');
  }
}
