import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../interfaces/authenticated-user.interface';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route/controller to the given roles. Must be used together
 * with `JwtAuthGuard` (to populate `request.user`) and `RolesGuard`.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
