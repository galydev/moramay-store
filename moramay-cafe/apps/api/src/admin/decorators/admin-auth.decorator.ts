import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Composite decorator enforcing the T-050 admin guard: verifies the JWT
 * (`JwtAuthGuard`) and requires the `admin` role (`RolesGuard` + `@Roles`).
 * Apply to every controller/handler under `/admin`.
 */
export const AdminOnly = () => applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles('admin'));
