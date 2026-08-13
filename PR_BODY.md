# PR: Backend suscripciones — módulo, tokenización Wompi, cron y confirmación manual

## Title
feat(subscriptions): implement subscriptions module, Wompi tokenization, billing cron and manual confirmation (T-040 a T-045)

## Body

### Resumen
Implementa el backend completo de suscripciones mensuales de Moramay Café: CRUD de
suscripciones, tokenización de método de pago con Wompi Payment Sources, cron
mensual de facturación y el flujo de confirmación manual (email + endpoint de
cobro). Basado en `jhonatan-galeano-ghtcorp-supreme-fortnight` (backend
foundation ya existente).

### Cambios
- **T-040** — Módulo `apps/api/src/subscriptions/`: `subscriptions.service.ts`,
  DTOs (`create-subscription.dto.ts`, `update-subscription.dto.ts`,
  `attach-payment-source.dto.ts`) e interfaces (`subscription.interface.ts`).
  Usa `SupabaseService.getClient()` (query builder) — sin SQL concatenado.
  Soporta `billing_mode`: `automatic` | `manual_confirmation`.
- **T-041** — `subscriptions.controller.ts`: `POST /subscriptions`,
  `PATCH /subscriptions/:id` (pausar, modificar, cancelar), `GET /subscriptions/me`.
  Protegidos con `JwtAuthGuard` + verificación de ownership en el service.
- **T-042** — Módulo `apps/api/src/payments/`: `wompi.service.ts`
  (`createPaymentSource` / `chargeWithSource`) usando `fetch` nativo (sin
  dependencias nuevas). `PATCH /subscriptions/:id/payment-source` para
  tokenizar/reemplazar el método de pago recurrente.
- **T-043** — `subscriptions/billing-cron.service.ts`: `@Cron` diario
  (`EVERY_DAY_AT_3AM`) que revisa `next_billing_date <= hoy` y ramifica según
  `billing_mode` (cobro automático vs. solicitud de confirmación manual). Los
  fallos por suscripción se aíslan para no bloquear el resto del batch.
- **T-044** — Módulo `apps/api/src/notifications/`: `email.service.ts` (Resend)
  + `POST /subscriptions/:id/confirm-charge` que procesa el cobro tras la
  confirmación del cliente y registra el resultado en
  `subscription_billing_history`.
- **T-045** — Sin UI (fuera de alcance de este backend); endpoints y DTOs
  documentados y estables para que el frontend de "Mi cuenta > Suscripciones"
  los consuma.

### Archivos nuevos
- `apps/api/src/subscriptions/` (module, controller, service, billing service, cron, dto/, interfaces/, specs)
- `apps/api/src/payments/` (module, wompi.service.ts, interfaces/)
- `apps/api/src/notifications/` (module, email.service.ts)
- `apps/api/src/app.module.ts` (registro de `SubscriptionsModule`)
- `PROGRESS.md` (bitácora de avance por tarea)

### Validación
- `npm run build` → OK
- `npm test` (apps/api) → 3 suites, 7 tests, todos pasan
- `npx eslint` sobre archivos nuevos → sin errores
  (el `npm run lint` global reporta errores CRLF preexistentes en archivos no
  tocados por este PR — `main.ts`, `health.*`, `logger.config.ts` — fuera de alcance)

### Notas
- Las migraciones de `subscriptions`, `subscription_items` y
  `subscription_billing_history` (010–012) ya existían; no se modificaron.
- `SubscriptionsService.listAllForAdmin()` queda listo para el futuro
  `admin/subscriptions.controller.ts` (T-054, fuera de este alcance).

### Issues relacionados
Closes #26, #27, #28, #29, #30, #31
