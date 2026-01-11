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
    const { sub: userId, email } = payload;

    if (!userId) {
      throw new UnauthorizedException('Invalid token: missing user ID');
    }

    const supabase = this.supabaseService.getClient();

    // Fetch user from Supabase database with organization relationship
    const { data: user, error } = await supabase
      .from('users')
      .select('*, organization:organizations(*)')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Return user object that will be attached to request.user
    return user as User;
  }
}
