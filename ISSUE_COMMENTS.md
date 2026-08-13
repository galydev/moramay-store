# Progress comments to paste on each GitHub issue

Paste the corresponding block as a comment on each issue. All work is implemented on branch
`jhonatan-galeano-ghtcorp-admin-backend-panel` (commits `73f5cdc`, `8a225f2`), based on
`jhonatan-galeano-ghtcorp-supreme-fortnight`.

---

## Issue #32 — T-050: Guard de rol admin

✅ Done.

Added an `AdminOnly()` composite decorator (`apps/api/src/admin/decorators/admin-auth.decorator.ts`) that applies `JwtAuthGuard` + `RolesGuard` + `@Roles('admin')` together. Applied to every controller under `/admin/*` (`products`, `orders`, `customers`, `subscriptions`, and the admin-only `POST /admin/invitations` route).

- Requests without a valid Supabase JWT get `401 Unauthorized`.
- Authenticated requests from a non-admin (`customer`) role get `403 Forbidden`.
- Only users present in the `admins` table with `status = 'active'` are treated as admin (resolved in the existing `JwtAuthGuard.resolveRole`).

Covered by `apps/api/src/admin/admin-guard.spec.ts` (4 tests: rejects customer, allows admin, allows any authenticated user when no roles required, confirms `ROLES_KEY` metadata lookup).

---

## Issue #33 — T-051: Endpoints CRUD de productos (admin)

✅ Done.

Added `apps/api/src/admin/products.controller.ts` / `products.service.ts`:
- `GET /admin/products` — list all products with their variants.
- `POST /admin/products` — create a product with one or more variants in a single call.
- `PATCH /admin/products/:id` — edit product fields (name, description, origin, roast date, lot number, base price, status).
- `PATCH /admin/products/:id/deactivate` — soft-delete (`status = 'inactive'`); products are never hard-deleted.
- `PATCH /admin/products/variants/:variantId` — edit a variant's price, stock, weight/grind or attribute label.

DTOs (`dto/create-product.dto.ts`, `update-product.dto.ts`, `update-product-variant.dto.ts`) validate every field with `class-validator`.

Covered by `apps/api/src/admin/products.service.spec.ts` (lists products mapping variants correctly, throws `NotFoundException` for a missing product).

---

## Issue #34 — T-052: Endpoints de listado y cambio de estado de pedidos (admin)

✅ Done.

Added `apps/api/src/admin/orders.controller.ts` / `orders.service.ts`:
- `GET /admin/orders` — list all orders (with their items), optional `?status=` query filter.
- `PATCH /admin/orders/:id/status` — transition an order's status (`pending`/`paid`/`shipped`/`delivered`/`cancelled`), validated via `UpdateOrderStatusDto`.

Covered by `apps/api/src/admin/orders.service.spec.ts` (lists orders with mapped items, throws `NotFoundException` when the order doesn't exist).

---

## Issue #35 — T-053: Endpoint de listado de clientes (admin)

✅ Done.

Added `apps/api/src/admin/customers.controller.ts` / `customers.service.ts`:
- `GET /admin/customers` — lists every customer account (basic info: name, email, phone, city, how the account was created) together with their full order history (id, status, total, date).

Covered by `apps/api/src/admin/customers.service.spec.ts`.

---

## Issue #36 — T-054: Endpoint de listado de suscripciones (admin)

✅ Done.

Added `apps/api/src/admin/subscriptions.controller.ts` / `subscriptions.service.ts`:
- `GET /admin/subscriptions` — lists every subscription (status, billing mode, next billing date) with its full billing history (billed date, amount, result, payment reference).

Covered by `apps/api/src/admin/subscriptions.service.spec.ts`.

---

## Issue #37 — T-055: Endpoint de invitación de administradores + email Resend

✅ Done.

Added `apps/api/src/admin/invitations.controller.ts` / `invitations.service.ts` and `apps/api/src/admin/email/resend-email.service.ts`:
- `POST /admin/invitations` (admin-only) — validates the email isn't already an admin, creates a Supabase Auth user via `auth.admin.generateLink({ type: 'invite', ... })`, inserts the `admins` row with `status = 'invited'`, and sends an invitation email through Resend with an accept-invitation link.
- `POST /admin/invitations/accept` (public — the invitee has no session yet) — receives `adminId` + a chosen `password`, sets the Supabase Auth user's password via `auth.admin.updateUserById`, and flips `admins.status` to `'active'`.

`RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `WEB_APP_URL` are read from the existing `.env` config (already present in `.env.example`).

Covered by `apps/api/src/admin/invitations.service.spec.ts` (4 tests: successful invite + email sent, rejects duplicate email with `ConflictException`, successful accept + role activation, throws `NotFoundException` for an unknown invitation).
