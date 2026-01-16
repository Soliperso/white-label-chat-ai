import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { User } from '../../users/entities/user.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
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
        return undefined;
      });

      const context = createMockExecutionContext();
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('Routes without role requirements', () => {
    it('should allow access when no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const user: Partial<User> = {
        id: '123',
        email: 'user@example.com',
        role: 'viewer',
        organizationId: 'org-123',
        isActive: true,
      } as User;

      const context = createMockExecutionContext(user);
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('Routes with role requirements', () => {
    it('should allow access when user has required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['admin'];
        return undefined;
      });

      const user: Partial<User> = {
        id: '123',
        email: 'admin@example.com',
        role: 'admin',
        organizationId: 'org-123',
        isActive: true,
      } as User;

      const context = createMockExecutionContext(user);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has one of multiple required roles', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['admin', 'manager'];
        return undefined;
      });

      const user: Partial<User> = {
        id: '123',
        email: 'manager@example.com',
        role: 'manager',
        organizationId: 'org-123',
        isActive: true,
      } as User;

      const context = createMockExecutionContext(user);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['admin'];
        return undefined;
      });

      const user: Partial<User> = {
        id: '123',
        email: 'viewer@example.com',
        role: 'viewer',
        organizationId: 'org-123',
        isActive: true,
      } as User;

      const context = createMockExecutionContext(user);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Access denied. Required roles: admin. Your role: viewer',
      );
    });

    it('should deny access when user is not authenticated', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['admin'];
        return undefined;
      });

      const context = createMockExecutionContext();

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('User not authenticated');
    });
  });

  describe('Super admin bypass', () => {
    it('should allow super_admin to access admin-only routes', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['admin'];
        return undefined;
      });

      const superAdmin: Partial<User> = {
        id: '123',
        email: 'superadmin@chatforge.com',
        role: 'super_admin',
        organizationId: null,
        isActive: true,
      } as User;

      const context = createMockExecutionContext(superAdmin);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow super_admin to access manager-only routes', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['manager'];
        return undefined;
      });

      const superAdmin: Partial<User> = {
        id: '123',
        email: 'superadmin@chatforge.com',
        role: 'super_admin',
        organizationId: null,
        isActive: true,
      } as User;

      const context = createMockExecutionContext(superAdmin);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow super_admin to access routes requiring multiple roles', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['admin', 'manager'];
        return undefined;
      });

      const superAdmin: Partial<User> = {
        id: '123',
        email: 'superadmin@chatforge.com',
        role: 'super_admin',
        organizationId: null,
        isActive: true,
      } as User;

      const context = createMockExecutionContext(superAdmin);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow super_admin to access any role-restricted route', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['admin', 'manager', 'viewer'];
        return undefined;
      });

      const superAdmin: Partial<User> = {
        id: '123',
        email: 'superadmin@chatforge.com',
        role: 'super_admin',
        organizationId: null,
        isActive: true,
      } as User;

      const context = createMockExecutionContext(superAdmin);
      expect(guard.canActivate(context)).toBe(true);
    });
  });
});
