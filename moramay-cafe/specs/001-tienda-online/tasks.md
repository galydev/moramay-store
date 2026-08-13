<!-- SDD Artifact | Version: 1.0 | Phase: Tasks | Updated: 2026-08-13 -->
<!-- Project: Moramay Café | Feature: 001-tienda-online -->

# Task Breakdown: Tienda Online Moramay Café

## Conventions
- [P] = Puede ejecutarse en paralelo
- [Story: USX] = Historia de usuario a la que pertenece
- [Dep: T-NNN] = Depende de la tarea T-NNN
- Rutas de archivo relativas a la raíz del proyecto (`moramay-cafe/`)
- Pruebas incluidas según lo exigido por la constitución (Artículo III): unit, integración, E2E

## Phase 0: Foundational Setup
- [ ] T-001: Inicializar estructura del monorepo (apps/web, apps/api) [P]
  - Files: `apps/web/`, `apps/api/`, `package.json` raíz (workspaces)
  - Acceptance: ambos proyectos existen y se pueden instalar con un solo comando
- [ ] T-002: Scaffold del frontend Next.js 14 + shadcn/ui + Tailwind [Dep: T-001]
  - Files: `apps/web/app/`, `apps/web/components/`, `apps/web/tailwind.config.ts`
  - Acceptance: `npm run dev` levanta una página en blanco funcional
- [ ] T-003: Scaffold del backend NestJS [Dep: T-001]
  - Files: `apps/api/src/main.ts`, `apps/api/src/app.module.ts`
  - Acceptance: `npm run start:dev` expone `/health` con 200 OK
- [ ] T-004: Crear esquema Supabase y migraciones (todas las tablas de data-model.md) [Dep: T-001]
  - Files: `apps/api/supabase/migrations/`
  - Acceptance: esquema aplicado coincide con data-model.md
- [ ] T-005: Integrar Supabase Auth en NestJS (guards JWT, roles customer/admin) [Dep: T-003, T-004]
  - Files: `apps/api/src/auth/`
  - Acceptance: endpoint protegido rechaza sin JWT válido y permite con JWT válido
- [ ] T-006: Configurar Docker (Dockerfile.web, Dockerfile.api, docker-compose.yml) [Dep: T-002, T-003]
  - Files: `Dockerfile.web`, `Dockerfile.api`, `docker-compose.yml`
  - Acceptance: `docker-compose up` levanta ambos servicios accesibles
- [ ] T-007: Configurar esqueleto de CI/CD con GitHub Actions [Dep: T-001]
  - Files: `.github/workflows/ci.yml`
  - Acceptance: pipeline corre lint + test + build en cada push
- [ ] T-008: Plantilla de variables de entorno [P]
  - Files: `apps/web/.env.example`, `apps/api/.env.example`
  - Acceptance: contiene todas las claves necesarias (Supabase, Wompi, Resend) sin valores reales
### Checkpoint: Foundational
- [ ] Ambos proyectos compilan, DB accesible, Auth funciona, CI/CD corre, Docker levanta el stack

## Phase 1: User Story US-005 — Navegación y descubrimiento del catálogo
Priority: Must Have
- [ ] T-010: Módulo catalog (products, product_variants) en NestJS [Dep: T-005] [Story: US-005]
  - Files: `apps/api/src/catalog/`
  - Acceptance: servicio retorna productos con variantes y stock_status calculado
- [ ] T-011: Endpoints GET /products, GET /products/:id [Dep: T-010] [Story: US-005]
  - Files: `apps/api/src/catalog/catalog.controller.ts`
  - Acceptance: respuesta coincide con contracts/api-spec.json
- [ ] T-012: Layout de páginas públicas (Home, Tienda, Merch, Nosotros, Contacto) [Dep: T-002] [P] [Story: US-005]
  - Files: `apps/web/app/(public)/`
  - Acceptance: navegación entre las 5 secciones sin requerir login
- [ ] T-013: Componentes de listado/detalle de producto con trazabilidad [Dep: T-011, T-012] [Story: US-005]
  - Files: `apps/web/components/product/`
  - Acceptance: ficha de producto muestra descripción, características, origen, tueste, lote
- [ ] T-014: Estado de carrito en cliente (localStorage) [Dep: T-002] [P] [Story: US-005]
  - Files: `apps/web/lib/cart-store.ts`
  - Acceptance: carrito persiste durante la sesión de navegación sin login
### Checkpoint: US-005
- [ ] Un visitante navega libremente y agrega productos al carrito sin autenticarse

## Phase 2: User Story US-001 — Compra única como invitado
Priority: Must Have
- [ ] T-020: Módulo shipping (CRUD shipping_rates + cálculo por ciudad) [Dep: T-005] [P] [Story: US-001]
  - Files: `apps/api/src/shipping/`
  - Acceptance: tarifas de Medellín, Bogotá, Santa Marta y "otras ciudades" configurables, no hardcodeadas
- [ ] T-021: Módulo orders (crear pedido, order_items) [Dep: T-010, T-020] [Story: US-001]
  - Files: `apps/api/src/orders/`
  - Acceptance: valida stock, calcula subtotal + envío + total
- [ ] T-022: Endpoint POST /orders con soporte invitado [Dep: T-021] [Story: US-001]
  - Files: `apps/api/src/orders/orders.controller.ts`
  - Acceptance: acepta pedido sin JWT (invitado) o con JWT (autenticado)
- [ ] T-023: Integración de pagos Wompi (widget + webhook) [Dep: T-022] [Story: US-001]
  - Files: `apps/api/src/payments/`
  - Acceptance: webhook valida firma y actualiza estado del pedido a `paid`
- [ ] T-024: Creación automática de cuenta al confirmar pago de invitado [Dep: T-023] [Story: US-001]
  - Files: `apps/api/src/customers/`
  - Acceptance: cuenta creada con email + cédula, pedido asociado a esa cuenta
- [ ] T-025: Email de confirmación de pedido vía Resend [Dep: T-023] [Story: US-001]
  - Files: `apps/api/src/notifications/`
  - Acceptance: cliente recibe email tras pago aprobado
- [ ] T-026: UI de checkout (revisión de carrito, ciudad, invitado/login, widget Wompi) [Dep: T-013, T-014, T-020] [Story: US-001]
  - Files: `apps/web/app/checkout/`
  - Acceptance: flujo completo de compra sin necesidad de registro previo
### Checkpoint: US-001
- [ ] Cliente completa compra como invitado, recibe confirmación por email, cuenta creada automáticamente

## Phase 3: User Story US-003 — Perfil del cliente
Priority: Must Have
- [ ] T-030: Módulo customers (perfil get/update) [Dep: T-024] [Story: US-003]
  - Files: `apps/api/src/customers/customers.service.ts`
  - Acceptance: retorna/actualiza datos personales, facturación y envío
- [ ] T-031: Endpoints GET/PATCH /customers/me [Dep: T-030] [Story: US-003]
  - Files: `apps/api/src/customers/customers.controller.ts`
  - Acceptance: requiere JWT válido, solo accede a su propio perfil
- [ ] T-032: Endpoint POST /orders/:id/return-request [Dep: T-021] [Story: US-003]
  - Files: `apps/api/src/orders/return-requests.ts`
  - Acceptance: crea solicitud con canal `site_button`
- [ ] T-033: UI "Mi cuenta" (perfil, historial de pedidos, facturación) [Dep: T-031] [P] [Story: US-003]
  - Files: `apps/web/app/cuenta/`
  - Acceptance: cliente ve estado de cada pedido y edita su información
- [ ] T-034: UI de login/registro (Supabase Auth) [Dep: T-002] [P] [Story: US-003]
  - Files: `apps/web/app/(auth)/`
  - Acceptance: se solicita solo al finalizar checkout o acceder a "Mi cuenta"
### Checkpoint: US-003
- [ ] Cliente autenticado ve su historial de pedidos y edita su información personal/facturación

## Phase 4: User Story US-002 — Suscripción mensual de café
Priority: Must Have
- [ ] T-040: Módulo subscriptions (CRUD, billing_mode, items) [Dep: T-030] [Story: US-002]
  - Files: `apps/api/src/subscriptions/`
  - Acceptance: crea suscripción con producto(s), cantidad y modo de cobro
- [ ] T-041: Endpoints POST /subscriptions, PATCH /subscriptions/:id [Dep: T-040] [Story: US-002]
  - Files: `apps/api/src/subscriptions/subscriptions.controller.ts`
  - Acceptance: permite pausar, modificar y cancelar
- [ ] T-042: Tokenización de método de pago (Wompi Payment Source) [Dep: T-023] [Story: US-002]
  - Files: `apps/api/src/payments/payment-sources.ts`
  - Acceptance: token reutilizable para cobros recurrentes
- [ ] T-043: Cron job mensual de facturación (@nestjs/schedule) [Dep: T-042] [Story: US-002]
  - Files: `apps/api/src/subscriptions/billing-cron.ts`
  - Acceptance: revisa `next_billing_date` y actúa según `billing_mode`
- [ ] T-044: Flujo de confirmación manual (email + POST /subscriptions/:id/confirm-charge) [Dep: T-043, T-025] [Story: US-002]
  - Files: `apps/api/src/subscriptions/manual-confirmation.ts`
  - Acceptance: cliente confirma vía email y se procesa el cobro
- [ ] T-045: UI de gestión de suscripciones en "Mi cuenta" [Dep: T-041, T-033] [Story: US-002]
  - Files: `apps/web/app/cuenta/suscripciones/`
  - Acceptance: cliente crea, pausa, modifica o cancela su suscripción
### Checkpoint: US-002
- [ ] Suscripción mensual funciona en ambos modos (automático y confirmación manual)

## Phase 5: User Story US-004 — Panel de administración
Priority: Must Have
- [x] T-050: Guard de rol admin en NestJS [Dep: T-005] [Story: US-004]
  - Files: `apps/api/src/admin/admin.guard.ts`
  - Acceptance: rechaza acceso a rutas /admin sin rol admin
- [x] T-051: Endpoints CRUD de productos (admin) [Dep: T-050, T-010] [P] [Story: US-004]
  - Files: `apps/api/src/admin/products.controller.ts`
- [x] T-052: Endpoints de listado y cambio de estado de pedidos (admin) [Dep: T-050, T-021] [P] [Story: US-004]
  - Files: `apps/api/src/admin/orders.controller.ts`
- [x] T-053: Endpoint de listado de clientes (admin) [Dep: T-050, T-030] [P] [Story: US-004]
  - Files: `apps/api/src/admin/customers.controller.ts`
- [x] T-054: Endpoint de listado de suscripciones (admin) [Dep: T-050, T-040] [P] [Story: US-004]
  - Files: `apps/api/src/admin/subscriptions.controller.ts`
- [x] T-055: Endpoint de invitación de administradores + email Resend [Dep: T-050] [P] [Story: US-004]
  - Files: `apps/api/src/admin/invitations.controller.ts`
- [ ] T-056: UI del panel admin (dashboard, productos, pedidos, clientes, suscripciones, invitar admin) [Dep: T-051, T-052, T-053, T-054, T-055] [Story: US-004]
  - Files: `apps/web/app/admin/`
  - Acceptance: administrador gestiona todas las entidades desde el panel
### Checkpoint: US-004
- [ ] Administrador gestiona productos, pedidos, cuentas y suscripciones completamente desde el panel

## Phase 6: Integración & Polish
- [ ] T-090: Pruebas E2E (Playwright) — flujo de compra completo y flujo de suscripción
  - Files: `apps/web/tests/e2e/`
- [ ] T-091: Pruebas de rendimiento vs criterios de éxito (API p95 <500ms, page load <3s)
  - Files: `apps/api/test/performance/`
- [ ] T-092: Revisión de seguridad (RBAC, validación de firma de webhook, gestión de secretos)
- [ ] T-093: Documentación final (README, Swagger, guía de despliegue Docker)

## Dependency Summary
```
T-001 ─┬─ T-002 ─┬─ T-012 [P] ── T-013 ── T-026
       │         └─ T-014 [P] ──────────┘
       ├─ T-003 ── T-005 ─┬─ T-010 ── T-011 ── T-013
       │                  ├─ T-020 [P] ── T-021 ── T-022 ── T-023 ─┬─ T-024 ── T-030 ─┬─ T-031 ── T-033
       │                  │                                       ├─ T-025            ├─ T-032
       │                  │                                       └─ T-042 ── T-043 ── T-044
       │                  └─ T-050 ─┬─ T-051
       │                            ├─ T-052
       │                            ├─ T-053
       │                            ├─ T-054
       │                            └─ T-055 ── T-056
       └─ T-004 ── (alimenta T-005, T-010, T-020, T-021, T-030, T-040)
```

## Backlog Mapping
| Task | GitHub Label | Priority |
|------|-------------|----------|
| T-001..008 | phase:foundation | P0 |
| T-010..014 | story:US-005 | P0 |
| T-020..026 | story:US-001 | P0 |
| T-030..034 | story:US-003 | P0 |
| T-040..045 | story:US-002 | P0 |
| T-050..056 | story:US-004 | P0 |
| T-090..093 | phase:polish | P1 |
