/**
 * Roles supported by the platform (data-model.md: `customers` / `admins`).
 */
export type UserRole = 'customer' | 'admin';

/**
 * Authenticated user attached to the request after JWT verification.
 * Mirrors the Supabase Auth JWT claims we rely on.
 */
export interface AuthenticatedUser {
  id: string;
  email: string | null;
  role: UserRole;
}
