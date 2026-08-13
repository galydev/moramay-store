import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

/**
 * Global auth module: exposes `SupabaseService`, `JwtAuthGuard`,
 * `OptionalJwtAuthGuard`, and `RolesGuard` so any feature module can protect
 * routes with `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles('admin')`,
 * or allow guest access with `@UseGuards(OptionalJwtAuthGuard)`.
 */
@Global()
@Module({
  providers: [SupabaseService, JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard],
  exports: [SupabaseService, JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard],
})
export class AuthModule {}
