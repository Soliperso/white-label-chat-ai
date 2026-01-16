import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_SUPER_ADMIN_KEY } from '../decorators/is-super-admin.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { User } from '../strategies/supabase-jwt.strategy';

/**
 * Guard to enforce super admin access on routes.
 * Checks if the route requires super admin (via @IsSuperAdmin() decorator)
 * and verifies the user has the 'super_admin' role.
 *
 * This guard should be applied globally or to specific admin routes.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is public - skip super admin check
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Check if route requires super admin
    const requiresSuperAdmin = this.reflector.getAllAndOverride<boolean>(IS_SUPER_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If route doesn't require super admin, allow access
    if (!requiresSuperAdmin) {
      return true;
    }

    // Get user from request (set by JWT strategy)
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user is super admin
    if (user.role !== 'super_admin') {
      throw new ForbiddenException(
        'Access denied. This resource is restricted to platform administrators only.',
      );
    }

    return true;
  }
}
