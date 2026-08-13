import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SupabaseService } from '../supabase.service';
import { AuthenticatedUser, UserRole } from '../interfaces/authenticated-user.interface';

/**
 * Verifies the `Authorization: Bearer <jwt>` header against Supabase Auth
 * and attaches the resolved `AuthenticatedUser` (including platform role)
 * to the request. Rejects with 401 when the token is missing or invalid.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Falta el token de autenticación.');
    }

    const client = this.supabaseService.getClient();
    const { data, error } = await client.auth.getUser(token);

    if (error || !data?.user) {
      this.logger.warn(`JWT inválido: ${error?.message ?? 'sin usuario'}`);
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    const role = await this.resolveRole(data.user.id);

    const user: AuthenticatedUser = {
      id: data.user.id,
      email: data.user.email ?? null,
      role,
    };

    (request as Request & { user: AuthenticatedUser }).user = user;
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
