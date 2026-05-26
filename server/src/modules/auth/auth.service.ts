// ──────────────────────────────────────────────
// Auth Service — handles authentication logic
// ──────────────────────────────────────────────

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env.config.js';
import { UnauthorizedError, BadRequestError, InternalError } from '../../common/errors/AppError.js';

class AuthService {
  private getAdminClient(): SupabaseClient {
    const supabaseKey = config.supabaseServiceKey && config.supabaseServiceKey !== 'your_supabase_service_role_key'
      ? config.supabaseServiceKey
      : config.supabaseAnonKey;

    return createClient(config.supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }

  private getAnonClient(): SupabaseClient {
    return createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }

  async login(email: string, password: string) {
    const anonClient = this.getAnonClient();

    const { data, error } = await anonClient.auth.signInWithPassword({ email, password });

    if (error) {
      throw new UnauthorizedError(error.message);
    }

    if (!data.user || !data.session) {
      throw new InternalError('Login failed — no session returned');
    }

    const tokens = this.generateTokens(data.user.id, email);

    return {
      user: {
        id: data.user.id,
        name: data.user.user_metadata.full_name || email.split('@')[0],
        email: data.user.email || email,
        image: data.user.user_metadata.avatar_url || null,
        joinedDate: new Date(data.user.created_at).toLocaleDateString(),
        level: 1,
      },
      tokens,
      supabaseSession: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      },
    };
  }

  async register(email: string, password: string, fullName: string) {
    const anonClient = this.getAnonClient();

    const { data, error } = await anonClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw new BadRequestError(error.message);
    }

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      userId: data.user?.id,
    };
  }

  async resetPassword(email: string, redirectUrl: string) {
    const anonClient = this.getAnonClient();
    const { error } = await anonClient.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      throw new BadRequestError(error.message);
    }

    return { message: 'Password reset link sent to your email.' };
  }

  async updatePassword(accessToken: string, newPassword: string) {
    const authedClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { error } = await authedClient.auth.updateUser({ password: newPassword });

    if (error) {
      throw new BadRequestError(error.message);
    }

    return { message: 'Password updated successfully.' };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as { userId: string; email: string };
      return this.generateTokens(decoded.userId, decoded.email);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  private generateTokens(userId: string, email: string) {
    const accessToken = jwt.sign(
      { userId, email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    const refreshToken = jwt.sign(
      { userId, email },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiresIn }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }
}

export const authService = new AuthService();