# Contribuir a Moramay Café

## Principios (ver constitution.md)
- Todo módulo debe tener límites claros e interfaces definidas antes de implementar.
- Cobertura mínima de pruebas unitarias: 70%. No se aceptan PRs sin pruebas pasando.
- No hardcodear secretos, connection strings ni configuración específica de entorno.
- Errores internos nunca deben filtrar detalles de implementación al usuario final.

## Flujo de trabajo
1. Crea una rama a partir de `main` con el formato `feature/T-NNN-descripcion-corta`.
2. Referencia el issue de GitHub correspondiente (`T-NNN`) en tu PR.
3. Asegúrate de que:
   - `npm run lint` pasa en el/los proyecto(s) modificado(s)
   - `npm test` pasa (unitarias e integración)
   - Si tocaste un flujo crítico (checkout, pagos, suscripciones), añade/actualiza pruebas E2E (Playwright)
4. Abre el PR contra `main`, vincula el issue, y espera revisión.

## Estructura de commits
Usa mensajes claros en imperativo: `feat: add subscription pause endpoint`, `fix: correct shipping rate for Bogotá`.

## Dudas sobre alcance
Si una tarea requiere una decisión no cubierta por `spec.md` o `plan.md`, NO asumas — abre una discusión
en el issue correspondiente antes de implementar. El spec es la fuente de verdad.
