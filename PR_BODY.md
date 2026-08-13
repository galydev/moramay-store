# PR Title

feat(api): admin backend panel (T-050 to T-055)

# PR Body

## Summary

Implements the backend for the admin panel of Moramay Café (user story US-004), covering tasks T-050 through T-055:

- **T-050** — Admin role guard: an `AdminOnly()` composite decorator (`JwtAuthGuard` + `RolesGuard` + `@Roles('admin')`) protects every `/admin/*` route. Non-admin or unauthenticated requests are rejected (`401`/`403`).
- **T-051** — Admin product CRUD: create products with their variants, edit product fields, deactivate products (soft delete via `status = 'inactive'`), and update individual variants (price, stock, attributes).
- **T-052** — Admin order management: list all orders (optionally filtered by `status`) and update an order's status (`pending → paid → shipped → delivered → cancelled`).
- **T-053** — Admin customer directory: list customer accounts with basic info and full order history per customer.
- **T-054** — Admin subscriptions view: list subscriptions with current status and full billing history.
- **T-055** — Admin invitation flow: invite a new admin (creates the Supabase Auth user + `admins` row with `status = 'invited'`, sends an invitation email via Resend) and a public accept-invitation endpoint that lets the invitee set a password and activates their account (`status = 'active'`).

## What changed

New module: `moramay-cafe/apps/api/src/admin/`
- `admin.module.ts` — wires all admin controllers/services into the app.
- `products.controller.ts` / `products.service.ts`
- `orders.controller.ts` / `orders.service.ts`
- `customers.controller.ts` / `customers.service.ts`
- `subscriptions.controller.ts` / `subscriptions.service.ts`
- `invitations.controller.ts` / `invitations.service.ts`
- `email/resend-email.service.ts` — thin Resend SDK wrapper for transactional email.
- `decorators/admin-auth.decorator.ts` — the `AdminOnly()` guard composite.
- `dto/` — `class-validator` DTOs for every request body.

Other changes:
- `app.module.ts` — registers `AdminModule`.
- `apps/api/package.json` — added `resend` dependency.
- `specs/001-tienda-online/tasks.md` — checked off T-050…T-055.
- `PROGRESS.md` — session progress notes.

## Conventions followed

- TypeScript strict, NestJS.
- No concatenated SQL — all data access goes through the Supabase query builder (`SupabaseService.getClient()`).
- Every public service method is `async`, wrapped in `try/catch`, logs with `this.logger.error(...)`, and re-throws with `throw error;` (JS/TS equivalent of "never swallow the original stack").
- Public list methods return `ReadonlyArray<T>`.
- Code and comments in English.

## Testing

- `npx tsc -p tsconfig.build.json --noEmit` → clean.
- `npx eslint "src/admin/**/*.ts" --max-warnings=0` → clean.
- `npx jest` → **7 suites / 15 tests passing** (6 new spec files: guard + one per service, covering success paths and `NotFoundException`/`ConflictException` edge cases).

## Definition of Done checklist

- [x] `/admin` routes protected by the admin role.
- [x] Product, order, customer, and subscription CRUD/listing endpoints work.
- [x] Admin invitation flow works end to end (invite → email → accept).
- [x] Tests pass.
- [ ] PR pushed and opened (this file is the template for that step).

## Related issues

Closes #32, #33, #34, #35, #36, #37
