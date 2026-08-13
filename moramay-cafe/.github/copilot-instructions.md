# Copilot Instructions — Moramay Café

Eres un agente de desarrollo trabajando en **Moramay Café**, una tienda de e-commerce de café de especialidad.

## Antes de escribir código
1. Lee `constitution.md` (raíz) — principios no negociables del proyecto.
2. Lee `specs/001-tienda-online/spec.md` — qué se está construyendo y por qué.
3. Lee `specs/001-tienda-online/plan.md` y `data-model.md` — cómo está diseñado técnicamente.
4. Consulta `specs/001-tienda-online/tasks.md` para el detalle de la tarea específica (archivos esperados,
   dependencias, criterios de aceptación).

## Stack
- Frontend: Next.js 14 (App Router) + TypeScript + shadcn/ui + Tailwind CSS — en `apps/web/`
- Backend: NestJS (TypeScript) — en `apps/api/`
- Base de datos/Auth: Supabase (PostgreSQL + Supabase Auth)
- Pagos: Wompi (Widget de Checkout + Payment Sources para recurrencia)
- Email: Resend
- Scheduler: `@nestjs/schedule` para el ciclo mensual de suscripciones

## Reglas obligatorias
- Todo módulo de negocio (catalog, orders, subscriptions, customers, admin, payments, shipping) vive en su
  propia carpeta dentro de `apps/api/src/`.
- Toda función pública de un servicio backend DEBE ser async, tener try/catch, loguear el error y relanzar
  con `throw` (nunca `throw ex` que destruye el stack trace).
- Sin secretos hardcodeados — usar variables de entorno (`.env`), nunca commitear valores reales.
- Métodos que retornan colecciones: `Promise<ReadonlyArray<T>>`, nunca exponer tipos de ORM/DB directamente.
- No crear interfaces o capas de abstracción (Factory, Strategy) si solo existe una implementación.
- Toda ruta bajo `/admin` requiere el guard de rol admin (ver T-050).
- Toda ruta que modifique datos de un cliente requiere JWT válido y solo puede afectar su propio recurso.
- El webhook de Wompi (`/payments/webhook`) DEBE validar la firma antes de procesar cualquier evento.

## Pruebas
- Unitarias: Vitest (frontend), Jest (backend) — cobertura mínima 70%
- Integración: Supertest sobre controladores NestJS
- E2E: Playwright — cubrir el flujo de compra completo y el flujo de suscripción

## Qué NO hacer
- No modificar `spec.md` sin seguir el proceso de Change Management.
- No agregar dependencias o herramientas nuevas de lint/test/build salvo que la tarea lo requiera explícitamente.
- No implementar funcionalidad marcada como "Out of Scope" en `spec.md` (facturación DIAN, envíos
  internacionales, integración automática de transportadoras, devoluciones automatizadas).
