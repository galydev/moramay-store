import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

/**
 * Global auth module: exposes `SupabaseService`, `JwtAuthGuard`, and
 * `RolesGuard` so any feature module can protect routes with
 * `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles('admin')`.
 */
@Global()
@Module({
  providers: [SupabaseService, JwtAuthGuard, RolesGuard],
  exports: [SupabaseService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
