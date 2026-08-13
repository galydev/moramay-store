# Moramay Café — Tienda Online

Tienda de e-commerce para café de especialidad, merchandising y suscripciones mensuales, con trazabilidad
completa de origen y tueste.

## Stack Tecnológico
- **Frontend**: Next.js 14 (App Router) + TypeScript + shadcn/ui + Tailwind CSS
- **Backend**: NestJS (TypeScript)
- **Base de datos / Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Pagos**: Wompi
- **Email**: Resend
- **Contenedores**: Docker (agnóstico de nube — Azure, AWS, GCP o VPS propio)
- **CI/CD**: GitHub Actions

## Estructura del proyecto
```
moramay-cafe/
├── apps/
│   ├── web/    # Frontend Next.js
│   └── api/    # Backend NestJS
├── docker-compose.yml
├── Dockerfile.web
├── Dockerfile.api
└── specs/001-tienda-online/   # Artefactos SDD: spec, plan, tasks, data-model
```

## Cómo correr el proyecto localmente (< 30 min)

### Requisitos previos
- Node.js 20+
- Docker y Docker Compose
- Cuenta de Supabase (proyecto creado)
- Cuenta de Wompi (sandbox) y Resend (API key de prueba)

### Pasos
1. Clona el repositorio: `git clone https://github.com/galydev/moramay-store.git`
2. Copia las plantillas de entorno:
   - `cp apps/web/.env.example apps/web/.env.local`
   - `cp apps/api/.env.example apps/api/.env`
3. Completa las variables con tus credenciales de Supabase, Wompi y Resend.
4. Instala dependencias: `npm install` (desde la raíz, workspaces)
5. Levanta el stack: `docker-compose up` (o `npm run dev` en cada app para desarrollo local sin Docker)
6. Frontend disponible en `http://localhost:3000`, API en `http://localhost:3001`

## Documentación SDD
Todos los artefactos de Spec-Driven Development están en `specs/001-tienda-online/`:
- `spec.md` — Especificación funcional (qué y por qué)
- `plan.md` — Plan de implementación (cómo, arquitectura)
- `research.md` — Decisiones técnicas y su justificación
- `data-model.md` — Modelo de datos
- `tasks.md` — Desglose de tareas
- `contracts/api-spec.json` — Contrato OpenAPI de la API

Ver también `constitution.md` en la raíz para los principios que gobiernan el proyecto.

## Testing
- Unitarias: Vitest (frontend), Jest (backend)
- Integración: Supertest sobre NestJS
- E2E: Playwright

## Contribuir
Ver [CONTRIBUTING.md](./CONTRIBUTING.md).
