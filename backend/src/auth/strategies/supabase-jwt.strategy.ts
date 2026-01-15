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
  role: string;
  organizationId: string;
  isActive: boolean;
  organization?: any;
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
      .select('id, email, role, organization_id, is_active')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new UnauthorizedException(
        `User profile not found in database. Please ensure your account is properly set up. Error: ${error?.message || 'User not found'}`
      );
    }

    // Return real user data from database
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id,
      isActive: user.is_active,
    };
  }
}
