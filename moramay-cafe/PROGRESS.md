# Progress — Admin Backend Panel (T-050 → T-055)

Branch: `jhonatan-galeano-ghtcorp-admin-backend-panel` (based on `jhonatan-galeano-ghtcorp-supreme-fortnight`)
Commit: `feat(api): admin backend panel (T-050 to T-055)`

## Status: Implementation complete, verified locally. Pending push + PR (waiting on git push token from coordinator).

| Task | Issue | Status | Notes |
|------|-------|--------|-------|
| T-050 | #32 | ✅ Done | `AdminOnly()` composite decorator (`JwtAuthGuard` + `RolesGuard` + `@Roles('admin')`) applied to all `/admin/*` controllers. Guard behavior covered by `admin-guard.spec.ts`. |
| T-051 | #33 | ✅ Done | `AdminProductsController`/`Service`: create product+variants, update product (incl. deactivate via `status=inactive`), update variant (stock/price/attrs). |
| T-052 | #34 | ✅ Done | `AdminOrdersController`/`Service`: list orders (optional `status` filter) with items, `PATCH /admin/orders/:id/status`. |
| T-053 | #35 | ✅ Done | `AdminCustomersController`/`Service`: list customers with basic info + order history. |
| T-054 | #36 | ✅ Done | `AdminSubscriptionsController`/`Service`: list subscriptions with status + billing history. |
| T-055 | #37 | ✅ Done | `AdminInvitationsController`/`Service` + `ResendEmailService`: `POST /admin/invitations` (admin-only, creates Supabase Auth invited user + `admins` row, sends email via Resend) and `POST /admin/invitations/accept` (public, sets password, activates account). |

## Files added
`apps/api/src/admin/` — module, 5 controllers, 6 services (incl. `email/resend-email.service.ts`), DTOs, `decorators/admin-auth.decorator.ts`, and one `*.spec.ts` per service/guard (6 spec files, 14 tests).

`apps/api/src/app.module.ts` — registers `AdminModule`.
`apps/api/package.json` — added `resend` dependency.
`specs/001-tienda-online/tasks.md` — checked off T-050..T-055.

## Verification
- `npx tsc -p tsconfig.build.json --noEmit` — clean.
- `npx eslint "src/admin/**/*.ts" --max-warnings=0` — clean (after `--fix`).
- `npx jest` — 7 suites / 15 tests passed (includes pre-existing health test).

## Remaining for coordinator
1. Provide push token / push access → push branch `jhonatan-galeano-ghtcorp-admin-backend-panel`.
2. Open PR referencing #32, #33, #34, #35, #36, #37.
3. Comment on each issue (#32–#37) with this progress summary — GitHub REST API access wasn't available in this session, so this file documents it instead.
