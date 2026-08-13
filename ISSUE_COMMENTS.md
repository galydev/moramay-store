# ISSUE_COMMENTS.md — Borradores de comentarios de avance (#26–#31)

> El usuario debe pegar manualmente estos comentarios en cada issue desde la UI
> de GitHub (la sesión del agente no tiene permisos de escritura en el repo).

## #26 — T-040: Módulo subscriptions (CRUD, billing_mode, items)
Implementado en la rama `jhonatan-galeano-ghtcorp-backend-subscriptions-wompi`:
módulo `apps/api/src/subscriptions/` (service + DTOs + interfaces), usando
`SupabaseService.getClient()` (sin SQL crudo). Soporta `billing_mode`
`automatic`/`manual_confirmation`. Tests unitarios en
`subscriptions.service.spec.ts` (creación, ownership, not found).

## #27 — T-041: Endpoints POST /subscriptions, PATCH /subscriptions/:id
Implementado: `SubscriptionsController` con `POST /subscriptions`,
`PATCH /subscriptions/:id` (status/billingMode/paymentSourceReference),
`GET /subscriptions/me`, protegidos con `JwtAuthGuard` + verificación de
ownership.

## #28 — T-042: Tokenización de método de pago (Wompi Payment Source)
Implementado: módulo `apps/api/src/payments/` con `WompiService`
(`createPaymentSource` / `chargeWithSource`) usando `fetch` nativo. Endpoint
`PATCH /subscriptions/:id/payment-source` para tokenizar/reemplazar el método
de pago recurrente.

## #29 — T-043: Cron job mensual de facturación (@nestjs/schedule)
Implementado: `BillingCronService` (`@nestjs/schedule`,
`@Cron(EVERY_DAY_AT_3AM)`) revisa `next_billing_date <= hoy` y ramifica por
`billing_mode` (cobro automático vía Wompi o solicitud de confirmación
manual). Los fallos por suscripción se aíslan para no bloquear el resto del
batch. Tests en `billing-cron.service.spec.ts`.

## #30 — T-044: Flujo de confirmación manual (email + POST /subscriptions/:id/confirm-charge)
Implementado: módulo `apps/api/src/notifications/` (`EmailService` vía Resend)
+ `POST /subscriptions/:id/confirm-charge` que procesa el cobro tras
confirmación del cliente y registra el resultado en
`subscription_billing_history`.

## #31 — T-045: UI de gestión de suscripciones en "Mi cuenta"
Sin UI implementada aquí (fuera de alcance de este backend), pero los
endpoints y contratos DTO quedan estables para que el frontend de
"Mi cuenta > Suscripciones" los consuma: `POST /subscriptions`,
`PATCH /subscriptions/:id`, `PATCH /subscriptions/:id/payment-source`,
`POST /subscriptions/:id/confirm-charge`, `GET /subscriptions/me`.
