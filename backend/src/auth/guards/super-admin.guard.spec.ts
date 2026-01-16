import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SuperAdminGuard } from './super-admin.guard';
import { IS_SUPER_ADMIN_KEY } from '../decorators/is-super-admin.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { User } from '../strategies/supabase-jwt.strategy';

describe('SuperAdminGuard', () => {
  let guard: SuperAdminGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperAdminGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<SuperAdminGuard>(SuperAdminGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockExecutionContext = (user?: Partial<User>): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  describe('Public routes', () => {
    it('should allow access to public routes', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return true;
        return false;
      });

      const context = createMockExecutionContext();
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('Non-super-admin routes', () => {
    it('should allow access when @IsSuperAdmin() is not applied', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const user: Partial<User> = {
        id: '123',
        email: 'user@example.com',
        role: 'admin',
        organizationId: 'org-123',
        isActive: true,
      };

      const context = createMockExecutionContext(user);
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('Super admin only routes', () => {
    beforeEach(() => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_SUPER_ADMIN_KEY) return true;
        return false;
      });
    });

    it('should allow access when user is super_admin', () => {
      const superAdmin: Partial<User> = {
        id: '123',
        email: 'admin@chatforge.com',
        role: 'super_admin',
        organizationId: null,
        isActive: true,
      };

      const context = createMockExecutionContext(superAdmin);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access when user is not super_admin', () => {
      const regularUser: Partial<User> = {
        id: '123',
        email: 'user@example.com',
        role: 'admin',
        organizationId: 'org-123',
        isActive: true,
      };

      const context = createMockExecutionContext(regularUser);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Access denied. This resource is restricted to platform administrators only.',
      );
    });

    it('should deny access when user is manager', () => {
      const manager: Partial<User> = {
        id: '123',
        email: 'manager@example.com',
        role: 'manager',
        organizationId: 'org-123',
        isActive: true,
      };

      const context = createMockExecutionContext(manager);
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should deny access when user is viewer', () => {
      const viewer: Partial<User> = {
        id: '123',
        email: 'viewer@example.com',
        role: 'viewer',
        organizationId: 'org-123',
        isActive: true,
      };

      const context = createMockExecutionContext(viewer);
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should deny access when user is not authenticated', () => {
      const context = createMockExecutionContext();
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('User not authenticated');
    });
  });
});
