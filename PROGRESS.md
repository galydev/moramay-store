# Progress — T-020 a T-025 (Backend orders/shipping/pagos Wompi)

Rama: `jhonatan-galeano-ghtcorp-fluffy-waddle` (a partir de `jhonatan-galeano-ghtcorp-supreme-fortnight`).

No se pudo actualizar los issues de GitHub vía API REST (no hay token disponible en este entorno de
agente). Se documenta aquí el avance para que el coordinador lo traslade a los issues #14–#19.

## T-020 — Módulo shipping (issue relacionado: story:US-001)
- `apps/api/src/shipping/`: `ShippingRatesRepository` (Supabase query builder, sin SQL concatenado),
  `ShippingService.getRateForCity(city)` con fallback a la tarifa `default`, `ShippingController`
  (`GET /shipping/rates?city=`).
- Tarifas ya seedeadas en `013_seed_shipping_rates.sql` (Medellín, Bogotá, Santa Marta, default).
- Tests: `shipping.service.spec.ts` (3 casos).

## T-021 — Módulo orders
- `apps/api/src/orders/`: entidades `Order`/`OrderItem`, `OrdersRepository`, `OrderItemsRepository`,
  `ProductVariantsLookupRepository` (lectura de `product_variants` + decremento atómico de stock),
  `OrdersService.createOrder()` valida stock, calcula subtotal + envío (via ShippingService) + total.
- Nueva migración `014_orders_guest_info.sql`: `orders.customer_id` ahora nullable y se agregan
  `guest_full_name/email/national_id/phone` — la cuenta de invitado se crea solo al aprobar el pago
  (T-024), no al crear el pedido.
- Tests: `orders.service.spec.ts` (4 casos: cálculo de totales, guest sin guestInfo, stock
  insuficiente, orden autenticada).

## T-022 — Endpoint POST /orders
- `OrdersController`: `POST /orders` con `OptionalJwtAuthGuard` (nuevo guard en
  `auth/guards/optional-jwt-auth.guard.ts`) — acepta invitado (sin token) o autenticado (JWT válido),
  nunca rechaza por falta de token. `GET /orders/:id` requiere JWT y solo permite ver el propio
  pedido (o admin).
- Respuesta incluye `paymentWidget` con los datos necesarios para abrir el widget de Wompi.

## T-023 — Integración Wompi
- `apps/api/src/payments/wompi.service.ts`: genera firma de integridad para el widget
  (`reference+amount+currency+secret` → SHA-256) y valida la firma de eventos del webhook
  (`properties concatenadas + timestamp + secret` → SHA-256, comparación case-insensitive).
- `PaymentsController`: `POST /payments/webhook` y alias `POST /webhooks/wompi`. Rechaza con 401 si
  la firma no coincide.
- `PaymentsWebhookService`: al recibir `APPROVED` marca el pedido como `paid` (y `DECLINED/ERROR/VOIDED`
  como `cancelled`).
- Tests: `wompi.service.spec.ts` (3 casos: firma del widget, checksum válido, checksum inválido).

## T-024 — Creación de cuenta al aprobar pago de invitado
- `apps/api/src/customers/guest-account.service.ts`: `findOrCreateForGuest()` — si ya existe un
  `customers` con ese email lo reutiliza; si no, crea el usuario en Supabase Auth
  (`auth.admin.createUser`, email confirmado, contraseña temporal derivada de la cédula + timestamp,
  nunca persistida/loggeada) y crea la fila en `customers` (`created_via='guest_checkout'`).
- Se dispara desde `PaymentsWebhookService` solo cuando `order.placedAsGuest && !order.customerId`, y
  el pedido se actualiza con el `customer_id` resultante.

## T-025 — Email de confirmación (Resend)
- `apps/api/src/notifications/notifications.service.ts`: usa `fetch` nativo (Node 18+) contra la API
  HTTP de Resend — se evitó agregar una dependencia nueva. Si `RESEND_API_KEY`/`RESEND_FROM_EMAIL` no
  están configuradas, se loggea un warning y se omite el envío (no rompe el flujo de pago).
- Se dispara desde `PaymentsWebhookService` tras marcar el pedido como `paid`.

## Convenciones aplicadas
- 100% TypeScript estricto, código en inglés, sin SQL concatenado (Supabase query builder).
- Todo método público de servicios: `async` + `try/catch` + `logger.error(err, message)` + `throw`
  (nunca `throw err`).
- Repositorios implementan `IRepository<TEntity>` (`common/repository/repository.interface.ts`); no
  se introdujo TypeORM/Prisma (no estaban configurados) para no sobre-diseñar.
- Colecciones de retorno público tipadas como `ReadonlyArray<T>`.

## Verificación
- `npm run lint` → 0 errores.
- `npm test` → 4 suites, 11 tests, todos en verde.
- `npm run build` (`nest build`) → compila sin errores.

## Pendiente para el coordinador
- Aplicar la migración `014_orders_guest_info.sql` en el entorno Supabase.
- Configurar `WOMPI_PUBLIC_KEY`, `WOMPI_PRIVATE_KEY`, `WOMPI_EVENTS_SECRET`, `RESEND_API_KEY`,
  `RESEND_FROM_EMAIL` en el `.env` real (ya están en `.env.example`).
- Comentar el avance en los issues #14–#19 y hacer merge del PR una vez revisado.
