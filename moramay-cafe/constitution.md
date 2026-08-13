<!-- SDD Artifact | Version: 1.0 | Phase: Constitution | Updated: 2026-08-13 -->
<!-- Project: Moramay Café -->

# Project Constitution: Moramay Café

## Preamble
This constitution establishes governing principles for Moramay Café, una tienda en línea (e-commerce)
de café en bolsas (varias presentaciones), merchandising y suscripciones. Todas las specs, planes, tareas
e implementaciones DEBEN cumplir estos principios. Las excepciones requieren justificación explícita en la
sección de Complexity Tracking del plan.

## Article I: Modularity
Cada feature DEBE iniciar como un módulo independiente y reutilizable con límites claros.
Implicaciones:
- Separación clara entre catálogo de productos, carrito/checkout, suscripciones, perfil de cliente y panel admin.
- Cada dominio de negocio (productos, pedidos, suscripciones, usuarios) vive en su propio módulo/carpeta.

## Article I.b: Alcance Mínimo Viable (MVP)
El MVP DEBE ser una tienda online completamente funcional, no un prototipo parcial. Implicaciones:
- Páginas públicas obligatorias: Home, Tienda (catálogo), Merch, Nosotros, Contacto, Carrito, Checkout.
- Autenticación NO es requerida para navegar, ver productos o agregar al carrito. Solo se exige login/registro
  al momento de finalizar el checkout o acceder a "Mi cuenta".
- Perfil de cliente autenticado DEBE incluir (estilo Shopify/WooCommerce): historial de pedidos y sus estados,
  información personal editable, información de facturación/envío.
- Panel de administración DEBE permitir gestión completa de: pedidos (ver, cambiar estado), productos,
  cuentas/clientes, y suscripciones.

## Article II: Interface-First Design
Todos los módulos DEBEN definir interfaces públicas antes de la implementación.
Implicaciones:
- Contratos de API (tipos TypeScript compartidos / OpenAPI) definidos antes de codificar endpoints.
- Los tipos de datos de Supabase (tablas, RPCs) se documentan en data-model.md antes de implementar.

## Article III: Testing Standards
- Cobertura mínima de pruebas unitarias: 70%
- Pruebas de integración: flujos críticos (checkout, pagos con Wompi, gestión de suscripciones, panel admin)
- E2E: flujo de compra completo (catálogo → carrito → pago → confirmación)
- Framework: Vitest/Jest (unitarias e integración), Playwright (E2E)
- No se permiten merges de PR sin pruebas pasando.

## Article IV: Configuration & Environment
Toda configuración externalizada. Sin connection strings, API keys, secretos, valores específicos de
entorno o feature flags hardcodeados.
Estándar: variables de entorno (.env), gestionadas de forma segura por proveedor (Supabase secrets,
GitHub Actions secrets). Compatible con despliegue en Docker en cualquier nube.

## Article V: Error Handling
- Formato de respuesta de error consistente en todas las APIs
- Logging estructurado para todos los errores
- Errores al usuario final DEBEN ser claros y accionables (ej. "El pago no pudo procesarse, verifica tu tarjeta")
- Errores internos NO DEBEN filtrar detalles de implementación al cliente

## Article VI: Observability
- Logging estructurado: JSON, librería estándar de Node/TypeScript (pino o similar)
- Trazabilidad: correlación de requests vía request ID
- Health checks: endpoint `/health` para el backend
- Alertas: notificación en fallos de pago o errores 5xx recurrentes

## Article VII: Security
- Autenticación: Supabase Auth (email/contraseña)
- Autorización: RBAC — roles `customer` y `admin`
- Protección de datos: cifrado en tránsito (HTTPS) y en reposo (Supabase managed)
- Gestión de secretos: variables de entorno / secret manager del proveedor de despliegue

## Article VIII: Performance
- Tiempo de respuesta de API: < 500ms p95
- Tiempo de carga de página: < 3s en conexión 4G
- Usuarios concurrentes objetivo: 500 usuarios simultáneos (fase inicial)

## Article IX: Documentation
- Documentación de API: OpenAPI/Swagger para endpoints backend
- Documentación de código: comentarios JSDoc en funciones públicas complejas
- El README debe permitir a un nuevo desarrollador correr el proyecto en < 30 minutos

## Technology Stack Governance
| Layer | Technology | Version | Non-negotiable? |
|-------|-----------|---------|-----------------|
| Frontend | Next.js | 14+ | Sí |
| Backend | TypeScript (Node.js) | 20+ | Sí |
| Base de datos | Supabase (PostgreSQL) | Latest | Sí |
| Autenticación | Supabase Auth | Latest | Sí |
| Pagos | Wompi | API v1 | Sí |
| Contenedores | Docker | Latest | Sí |
| Hosting | Agnóstico de nube (Azure/AWS/GCP/VPS) vía Docker | N/A | No (debe permanecer portable) |
| CI/CD | GitHub Actions | N/A | Sí |

## Amendments
| # | Date | Description | Rationale |
|---|------|-------------|-----------|
| 1 | 2026-08-13 | Constitución inicial | Kickoff del proyecto Moramay Café |
