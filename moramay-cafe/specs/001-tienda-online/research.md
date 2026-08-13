<!-- SDD Artifact | Version: 1.0 | Phase: Plan | Updated: 2026-08-13 -->
<!-- Project: Moramay Café | Feature: 001-tienda-online -->

# Research: Tienda Online Moramay Café

## R-001: Integración de pagos Wompi
**Pregunta:** ¿Cómo integrar Wompi para pago único (checkout) y cobros recurrentes (suscripciones)?
**Hallazgos:**
- Wompi ofrece un Widget de Checkout embebible y una API transaccional directa.
- Para cobros recurrentes, Wompi soporta "Fuentes de pago" (payment sources) que permiten tokenizar el método
  de pago del cliente y cobrar en ciclos posteriores sin reingresar los datos (necesario para suscripciones
  con cobro automático).
- Wompi notifica eventos (aprobado, declinado, error) vía webhook firmado (evento + checksum de integridad).
**Decisión:** Usar Widget de Checkout para el primer pago (compra única y primer ciclo de suscripción),
y Payment Sources para cobros recurrentes automáticos. El backend valida la firma del webhook antes de
procesar cualquier actualización de estado.
**Alternativas consideradas:** Cobro 100% manual (rechazado — el cliente pidió opción automática también).

## R-002: Modelo de suscripciones (automático vs manual)
**Pregunta:** ¿Cómo modelar la elección del cliente entre cobro automático y notificación manual?
**Hallazgos:** Es una preferencia por suscripción (no global), configurable al crear o editar la suscripción.
**Decisión:** Campo `billing_mode` en la entidad Suscripción con valores `automatic` | `manual_confirmation`.
El cron job mensual (`@nestjs/schedule`) revisa suscripciones activas cuyo `next_billing_date` llegó:
- Si `automatic`: dispara cobro con Wompi Payment Source y actualiza `next_billing_date`.
- Si `manual_confirmation`: envía email vía Resend con link para confirmar y pagar; si no confirma en X días,
  se marca como `pending_confirmation` y se reintenta notificar.

## R-003: Cálculo de envío por ciudad
**Pregunta:** ¿Cómo estructurar las tarifas de envío fijas por ciudad?
**Decisión:** Tabla `shipping_rates` (ciudad, tarifa) gestionable desde el panel admin, con una tarifa
`default` para "otras ciudades". Evita hardcodear valores en código (cumple Artículo IV de la constitución).

## R-004: Creación automática de cuenta para compras como invitado
**Pregunta:** ¿Cómo crear una cuenta Supabase Auth automáticamente tras una compra de invitado?
**Hallazgos:** Supabase Auth Admin API permite crear usuarios desde el backend (service role key) sin
requerir contraseña inicial, enviando luego un email de "configura tu contraseña" o magic link.
**Decisión:** Al confirmar el pago de un pedido de invitado, el backend crea el usuario vía Admin API
(si el correo no existe aún), asocia el pedido a ese `customer_id`, y envía email con Resend invitando a
establecer contraseña y acceder a "Mi cuenta".

## R-005: Rol de administrador vía invitación
**Pregunta:** ¿Cómo implementar la invitación de nuevos administradores desde el panel?
**Decisión:** Un admin autenticado ingresa el correo del nuevo admin; el backend crea/invita el usuario en
Supabase Auth con metadata `role: admin` y envía email de invitación vía Resend con link de acceso.
Los guards de NestJS validan el rol `admin` en el JWT/metadata antes de permitir acceso a rutas de `/admin`.

## R-006: Contenerización agnóstica de nube
**Pregunta:** ¿Cómo estructurar Docker para que corra igual en Azure, AWS, GCP o un VPS propio?
**Decisión:** Dos Dockerfiles independientes (`Dockerfile.web`, `Dockerfile.api`) sin dependencias de SDKs
propietarios de ningún proveedor cloud. `docker-compose.yml` para desarrollo local y como referencia de
despliegue; en producción cada contenedor se puede desplegar en Azure Container Apps, AWS ECS, Cloud Run
o un VPS con Docker Compose/Nginx como reverse proxy, sin cambios de código.

## R-007: Framework de testing
**Decisión:**
- **Unit**: Vitest en frontend (Next.js), Jest en backend (default de NestJS).
- **Integración**: Supertest sobre los controladores NestJS, con Supabase de prueba (proyecto/schema aislado).
- **E2E**: Playwright cubriendo el flujo de compra completo (catálogo → carrito → checkout → confirmación)
  y el flujo de suscripción.
