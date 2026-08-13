# PROGRESS.md — Backend Subscriptions & Wompi (T-040 a T-045)

> No se pudo comentar en los issues de GitHub (#26–#31): tanto `gh issue comment`
> (GraphQL) como la API REST (`Invoke-RestMethod`) devuelven
> `403 Unauthorized: As an Enterprise Managed User, you cannot access this content`.
> Se documenta aquí el avance por tarea, según lo indicado como fallback.

## T-040 — Módulo subscriptions (issue #26) ✅
- `apps/api/src/subscriptions/subscriptions.service.ts`
- `apps/api/src/subscriptions/interfaces/subscription.interface.ts`
- `apps/api/src/subscriptions/dto/{create,update}-subscription.dto.ts`
- Usa `SupabaseService.getClient()` (query builder, sin SQL concatenado).
- Soporta `billing_mode`: `automatic` | `manual_confirmation`.
- Tests: `subscriptions.service.spec.ts` (creación, ownership, not found).

## T-041 — Endpoints POST/PATCH /subscriptions (issue #27) ✅
- `apps/api/src/subscriptions/subscriptions.controller.ts`
- `POST /subscriptions`, `PATCH /subscriptions/:id` (pausar/reanudar/modificar/cancelar),
  `GET /subscriptions/me`.
- Protegidos con `JwtAuthGuard`; verificación de ownership en el service.

## T-042 — Tokenización Wompi Payment Sources (issue #28) ✅
- `apps/api/src/payments/wompi.service.ts` + `payments.module.ts`
- `createPaymentSource` (token reutilizable) y `chargeWithSource` (cobro recurrente).
- `PATCH /subscriptions/:id/payment-source` para asociar/reemplazar el token.
- Cliente HTTP con `fetch` nativo (sin dependencias nuevas).

## T-043 — Cron mensual de facturación (issue #29) ✅
- `apps/api/src/subscriptions/billing-cron.service.ts`
- `@Cron(CronExpression.EVERY_DAY_AT_3AM)`: revisa `next_billing_date <= hoy`
  y ramifica por `billing_mode` (cobro automático vs. solicitud de confirmación manual).
- Fallas por suscripción se aíslan (no detienen el resto del batch).
- Tests: `billing-cron.service.spec.ts`.

## T-044 — Confirmación manual (issue #30) ✅
- `apps/api/src/notifications/email.service.ts` (Resend) + `notifications.module.ts`.
- `POST /subscriptions/:id/confirm-charge`: cobra vía Wompi tras confirmación del
  cliente y registra el resultado en `subscription_billing_history`.
- `apps/api/src/subscriptions/subscriptions-billing.service.ts` centraliza la
  lógica compartida entre cron y confirmación manual.

## T-045 — Contratos para frontend (issue #31) ✅
- Sin UI (fuera de alcance). Endpoints/DTOs estables listos para "Mi cuenta > Suscripciones":
  - `POST /subscriptions`
  - `PATCH /subscriptions/:id`
  - `PATCH /subscriptions/:id/payment-source`
  - `POST /subscriptions/:id/confirm-charge`
  - `GET /subscriptions/me`

## Validación
- `npm run build` → OK.
- `npm test` (apps/api) → 3 suites, 7 tests, todos pasan.
- `npx eslint` sobre los archivos nuevos (`subscriptions/`, `payments/`, `notifications/`,
  `app.module.ts`) → sin errores. (El `npm run lint` global falla por CRLF en archivos
  preexistentes no relacionados con esta tarea: `main.ts`, `health.*`, `logger.config.ts`;
  no se modificaron por estar fuera de alcance.)

## Pendiente fuera de este alcance
- `admin/subscriptions.controller.ts` (listado admin, T-054) — el método
  `SubscriptionsService.listAllForAdmin()` ya está listo para consumirlo.
- Migraciones SQL de subscriptions (010–012) ya existían previamente; no se modificaron.
