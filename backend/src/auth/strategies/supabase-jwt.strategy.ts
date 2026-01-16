import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SupabaseService } from '../supabase.service';

interface JwtPayload {
  sub: string;
  email: string;
  aud?: string;
  role?: string;
  exp?: number;
  iat?: number;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer' | 'super_admin';
  organizationId: string | null; // null for super_admin users
  isActive: boolean;
  organization?: any;
  superAdminMetadata?: Record<string, any>;
}

@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(Strategy, 'supabase-jwt') {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SUPABASE_JWT_SECRET'),
      audience: 'authenticated',
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { sub: userId } = payload;

    if (!userId) {
      throw new UnauthorizedException('Invalid token: missing user ID');
    }

    // Query the database for the actual user profile
    const supabase = this.supabaseService.getClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, organization_id, is_active, super_admin_metadata')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new UnauthorizedException(
        `User profile not found in database. Please ensure your account is properly set up. Error: ${error?.message || 'User not found'}`
      );
    }

    // For super_admin users, organization_id can be null
    // For regular users, organization_id must exist
    if (user.role !== 'super_admin' && !user.organization_id) {
      throw new UnauthorizedException(
        'User account is not properly configured. Please contact support.'
      );
    }

    // Return real user data from database
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id || null,
      isActive: user.is_active,
      superAdminMetadata: user.super_admin_metadata || {},
    };
  }
}
