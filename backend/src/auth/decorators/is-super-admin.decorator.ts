import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for marking routes that require super admin access.
 * Used by SuperAdminGuard to enforce super admin-only access.
 */
export const IS_SUPER_ADMIN_KEY = 'isSuperAdmin';

/**
 * Decorator to mark routes as super admin only.
 * When applied, only users with role 'super_admin' can access the route.
 *
 * @example
 * ```typescript
 * @Get('admin/organizations')
 * @IsSuperAdmin()
 * async getAllOrganizations() {
 *   // Only super admins can access this
 * }
 * ```
 */
export const IsSuperAdmin = () => SetMetadata(IS_SUPER_ADMIN_KEY, true);
