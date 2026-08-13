import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { SupabaseService } from '../supabase.service';
import { AuthenticatedUser, UserRole } from '../interfaces/authenticated-user.interface';

/**
 * Like `JwtAuthGuard`, but never rejects the request: when no valid token
 * is present, `request.user` is simply left undefined so the route handler
 * can treat the caller as a guest (used by `POST /orders`, which supports
 * both guest and authenticated checkout).
 */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(OptionalJwtAuthGuard.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const token = this.extractToken(request);

    if (!token) {
      return true;
    }

    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client.auth.getUser(token);

      if (error || !data?.user) {
        this.logger.warn(`Optional auth: invalid token ignored (${error?.message ?? 'no user'})`);
        return true;
      }

      const role = await this.resolveRole(data.user.id);
      request.user = { id: data.user.id, email: data.user.email ?? null, role };
    } catch (error) {
      this.logger.warn(
        `Optional auth: token verification failed, treating as guest (${String(error)})`,
      );
    }

    return true;
  }

  private extractToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (!header) return null;
    const [scheme, token] = header.split(' ');
    return scheme?.toLowerCase() === 'bearer' && token ? token : null;
  }

  private async resolveRole(userId: string): Promise<UserRole> {
    const client = this.supabaseService.getClient();
    const { data: admin } = await client
      .from('admins')
      .select('id')
      .eq('id', userId)
      .eq('status', 'active')
      .maybeSingle();

    return admin ? 'admin' : 'customer';
  }
}
