# HANDOFF — Moramay Café

## Estado del proyecto
Artefactos SDD completos para la Feature **001-tienda-online**: Constitución, Spec (aprobado), Plan,
Research, Data Model, Tasks (40 tareas) y contrato OpenAPI. Listo para implementación.

## Contexto de negocio
Moramay Café es una tienda en línea de café de especialidad. Los clientes compran bolsas de café (250g/340g,
grano entero o molido en 3 niveles), merchandising (tazas, camisetas, prensa francesa, filtros, Chemex, vasos,
gorras, pañoletas), y pueden suscribirse a entregas mensuales con cobro automático o confirmación manual.
Envíos solo dentro de Colombia, con tarifas fijas por ciudad (Medellín, Bogotá, Santa Marta, otras).

## Decisiones clave ya tomadas (ver research.md para el detalle)
1. Backend separado del frontend: NestJS + Next.js (dos apps independientes).
2. Pagos con Wompi: Widget de Checkout para pago único/primer ciclo, Payment Sources para cobro recurrente.
3. Cuentas se crean automáticamente al confirmar el pago de un cliente invitado (vía Supabase Auth Admin API).
4. Rol de administrador se asigna solo por invitación desde el propio panel admin (no auto-registro).
5. Productos sin stock se muestran como "Agotado" en el catálogo (no se ocultan).
6. Scheduler de suscripciones implementado con `@nestjs/schedule` dentro del backend NestJS.

## Próximos pasos para quien continúe
1. Leer `specs/001-tienda-online/spec.md`, `plan.md`, `data-model.md` y `tasks.md` en ese orden.
2. Empezar por las tareas de `Phase 0: Foundational Setup` en `tasks.md` (T-001 a T-008) — están mapeadas
   a issues de GitHub con el label `phase:foundation` y el milestone `001-tienda-online`.
3. Seguir el orden de dependencias: Foundation → US-005 (catálogo público) → US-001 (compra invitado) →
   US-003 (perfil) → US-002 (suscripciones) → US-004 (panel admin) → Integración/Polish.
4. Cada tarea en GitHub Issues incluye archivos esperados, dependencias y criterios de aceptación.
5. Ver `work-item-map.json` en `specs/001-tienda-online/` para el mapeo tarea → issue de GitHub.

## Contactos / Fuente de la verdad
- El spec (`spec.md`) es la fuente de verdad del QUÉ y POR QUÉ — no debe modificarse sin pasar por
  Change Management (ver instrucciones de la metodología SDD).
- Cualquier cambio de alcance debe generar un Change Impact Report antes de tocar tareas ya creadas.
