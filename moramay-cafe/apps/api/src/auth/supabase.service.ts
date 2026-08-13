import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Wraps the Supabase service-role client used server-side to verify JWTs
 * issued by Supabase Auth and to resolve platform roles.
 */
@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private readonly client: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !serviceRoleKey) {
      this.logger.warn(
        'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not configured; auth guard will reject all requests.',
      );
    }

    // Fall back to a placeholder URL/key so the app can boot in
    // environments (e.g. local dev without Supabase configured) where auth
    // is not yet exercised; JwtAuthGuard will still reject every request.
    this.client = createClient(
      url || 'http://localhost:54321',
      serviceRoleKey || 'placeholder-service-role-key',
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
