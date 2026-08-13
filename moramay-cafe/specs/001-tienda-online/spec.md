<!-- SDD Artifact | Version: 1.0 | Phase: Specify | Updated: 2026-08-13 -->
<!-- Project: Moramay Café | Feature: 001-tienda-online -->

# Feature Specification: Tienda Online Moramay Café

## Overview
**Feature Name:** Tienda Online Moramay Café
**Feature Number:** 001
**Date:** 2026-08-13
**Status:** Approved

### Problem Statement
Los amantes del café de especialidad no tienen una forma fácil, rápida y directa (sin intermediarios) de comprar
los productos de Moramay Café, ni de recibir su café favorito de forma recurrente y fresca en casa con
información clara sobre su origen y trazabilidad.

### Proposed Solution
Una tienda en línea responsive donde los clientes pueden explorar y comprar café de especialidad (en varias
presentaciones), merchandising, y suscribirse a entregas mensuales de sus productos favoritos, viendo en todo
momento el origen, tueste y trazabilidad de lo que compran.

### Target Users
- **Consumidor de café de especialidad**: persona que valora la calidad, el origen y la frescura del café,
  compra para consumo propio en casa, y puede preferir la comodidad de una entrega recurrente (suscripción).

## User Stories

### US-001: Compra única como invitado
As a consumidor de café de especialidad, I want to comprar bolsas de café o merch sin crear una cuenta previamente, So that puedo completar mi compra de forma rápida y sin fricción.

**Acceptance Criteria:**
- Given un cliente nuevo navegando el catálogo, When agrega productos al carrito y procede al checkout, Then puede completar el pago sin haberse registrado previamente.
- Given que el cliente completa el pago como invitado, When el pedido se confirma, Then el sistema crea automáticamente una cuenta asociada a su correo electrónico y número de cédula para futuras consultas.
- Given una ficha de producto, When el cliente la visualiza, Then puede ver descripción, características y trazabilidad (origen/finca, fecha de tueste, lote).

**Priority:** Must Have

### US-002: Suscripción mensual de café
As a consumidor de café de especialidad, I want to suscribirme a una entrega mensual de uno o varios productos, So that siempre tengo café fresco en casa sin tener que comprar manualmente cada vez.

**Acceptance Criteria:**
- Given un cliente autenticado, When configura una suscripción, Then puede elegir producto(s), cantidad y frecuencia mensual.
- Given una suscripción activa, When llega la fecha del ciclo, Then el cliente puede elegir entre cobro automático o recibir una notificación para confirmar el cobro manualmente.
- Given una suscripción activa, When el cliente lo desea, Then puede pausar, modificar (producto/cantidad) o cancelar la suscripción desde su perfil.

**Priority:** Must Have

### US-003: Perfil del cliente
As a consumidor de café de especialidad, I want to acceder a mi perfil con mis pedidos, información personal y de facturación, So that puedo dar seguimiento a mis compras y mantener mis datos actualizados.

**Acceptance Criteria:**
- Given un cliente autenticado, When entra a "Mi cuenta", Then ve su historial de pedidos con su estado actual.
- Given un cliente autenticado, When edita su información personal o de facturación/envío, Then los cambios se guardan y aplican a futuros pedidos.
- Given un pedido en su historial, When el cliente quiere solicitar una devolución/reclamación, Then puede iniciar el proceso vía un botón, WhatsApp o correo electrónico.

**Priority:** Must Have

### US-004: Gestión administrativa (panel admin)
As a administrador de Moramay Café, I want to gestionar productos, pedidos, cuentas de clientes y suscripciones desde un panel, So that puedo operar la tienda sin depender de acceso técnico directo a la base de datos.

**Acceptance Criteria:**
- Given un administrador autenticado, When accede al panel admin, Then puede crear, editar y desactivar productos (incluyendo presentaciones, precio, stock y trazabilidad).
- Given un administrador autenticado, When revisa los pedidos, Then puede ver el detalle y actualizar su estado (ej. pendiente, pagado, enviado, entregado, cancelado).
- Given un administrador autenticado, When revisa las suscripciones, Then puede ver el estado de cada una (activa, pausada, cancelada) y el historial de cobros.
- Given un administrador autenticado, When revisa cuentas de clientes, Then puede ver su información básica e historial de pedidos.

**Priority:** Must Have

### US-005: Navegación y descubrimiento del catálogo
As a visitante del sitio, I want to navegar libremente por Home, Tienda, Merch, Nosotros y Contacto sin necesidad de iniciar sesión, So that puedo conocer los productos y la marca antes de decidir comprar.

**Acceptance Criteria:**
- Given cualquier visitante, When entra al sitio, Then puede navegar Home, Tienda, Merch, Nosotros y Contacto sin autenticarse.
- Given un visitante sin cuenta, When agrega productos al carrito, Then el carrito persiste durante su sesión de navegación.
- Given un visitante, When intenta acceder a "Mi cuenta" o finalizar el checkout, Then el sistema le solicita iniciar sesión o registrarse.

**Priority:** Must Have

## Functional Requirements

**FR-001:** El sistema DEBE mostrar un catálogo de productos de café con presentaciones por peso (250g, 340g) y tipo de molienda (grano entero, molienda fina, media, gruesa).  [Must Have]
**FR-002:** El sistema DEBE mostrar un catálogo de merchandising (tazas, camisetas, prensa francesa, filtros, Chemex, vasos, gorras, pañoletas).  [Must Have]
**FR-003:** Cada ficha de producto DEBE incluir descripción, características y datos de trazabilidad (origen/finca, fecha de tueste, lote).  [Must Have]
**FR-004:** El sistema DEBE permitir compras como invitado, creando automáticamente una cuenta asociada a correo y cédula tras la primera compra.  [Must Have]
**FR-005:** El sistema DEBE permitir suscripciones mensuales configurables por producto, cantidad y modalidad de cobro (automático o confirmación manual).  [Must Have]
**FR-006:** El sistema DEBE permitir a los clientes pausar, modificar o cancelar sus suscripciones desde su perfil.  [Must Have]
**FR-007:** El sistema DEBE mostrar en el perfil del cliente su historial de pedidos con estado, información personal e información de facturación/envío editable.  [Must Have]
**FR-008:** El sistema DEBE procesar los pagos exclusivamente a través de Wompi (tarjetas, PSE, Nequi y demás métodos soportados por Wompi).  [Must Have]
**FR-009:** El sistema DEBE calcular el costo de envío según la ciudad de destino (tarifas fijas: Medellín, Bogotá, Santa Marta, otras ciudades), limitado a envíos dentro de Colombia.  [Must Have]
**FR-010:** El sistema DEBE proveer un panel de administración para gestionar productos, pedidos (incluyendo cambio de estado), cuentas de clientes y suscripciones.  [Must Have]
**FR-011:** El sistema DEBE permitir la navegación pública (Home, Tienda, Merch, Nosotros, Contacto, Carrito) sin requerir autenticación.  [Must Have]
**FR-012:** El sistema DEBE requerir autenticación únicamente al finalizar el checkout o al acceder a "Mi cuenta".  [Must Have]
**FR-013:** El sistema DEBE permitir al cliente iniciar una solicitud de devolución/reclamación desde un pedido, mediante botón, WhatsApp o correo electrónico.  [Should Have]
**FR-014:** El sistema DEBE ser completamente responsive (móvil, tablet, escritorio).  [Must Have]
**FR-015:** El sistema DEBE permitir que un administrador existente invite a nuevos administradores desde el panel admin.  [Must Have]
**FR-016:** El sistema DEBE marcar los productos sin stock como "Agotado" en el catálogo, visibles pero no comprables.  [Must Have]

## Entity Overview
- **Producto**: Representa un artículo vendible (café o merch). Tiene nombre, descripción, categoría (café/merch),
  precio, presentaciones (peso y molienda, si aplica), stock, e información de trazabilidad (origen, finca,
  fecha de tueste, lote).
- **Pedido**: Representa una compra realizada por un cliente. Contiene los productos comprados, cantidades,
  dirección de envío, costo de envío, estado (pendiente, pagado, enviado, entregado, cancelado), y referencia
  de pago.
- **Cliente**: Persona que compra en la tienda. Tiene información personal, correo electrónico, cédula,
  información de facturación/envío, historial de pedidos y suscripciones asociadas.
- **Suscripción**: Relación recurrente entre un cliente y uno o varios productos, con frecuencia mensual,
  modalidad de cobro (automático/manual), estado (activa, pausada, cancelada) e historial de cobros.
- **Administrador**: Usuario con permisos para gestionar productos, pedidos, cuentas y suscripciones desde
  el panel admin.
- **Solicitud de Devolución/Reclamación**: Registro asociado a un pedido donde el cliente reporta un problema,
  con canal de origen (botón en sitio, WhatsApp, correo).

## Success Criteria
SC-001: Tasa de conversión del sitio ≥1.5% en los primeros 3 meses, con meta de 2.5% en el primer año.
SC-002: Tasa de abandono de carrito por debajo del 70% en los primeros 3 meses, con meta de 60% en el primer año.
SC-003: Tráfico mensual de 1,000 visitantes únicos en los primeros 3 meses, con crecimiento mensual del 20%.

## Assumptions & Dependencies
### Assumptions
- Los clientes objetivo compran principalmente desde Colombia y en su mayoría desde dispositivos móviles.
- El equipo de Moramay Café gestionará manualmente el empaque y despacho de pedidos (sin integración automática
  de transportadora en este MVP).
- Las tarifas de envío por ciudad son fijas y se actualizan manualmente por el equipo administrador.

### Dependencies
- Disponibilidad de un proveedor de procesamiento de pagos que soporte tarjetas, PSE y billeteras digitales
  locales.
- Un canal de comunicación externo (mensajería/correo) para solicitudes de devolución fuera del flujo
  automatizado del sitio.

## Scope Boundaries
### In Scope
- Catálogo de café (por peso y molienda) y merchandising.
- Compra como invitado con creación automática de cuenta.
- Suscripciones mensuales con cobro automático o manual.
- Perfil de cliente con historial de pedidos, datos personales y de facturación.
- Panel de administración de productos, pedidos, cuentas y suscripciones.
- Cálculo de envío por ciudad (dentro de Colombia).
- Sitio completamente responsive.

### Out of Scope
- Facturación electrónica DIAN (queda como informativa/opcional en esta fase).
- Integración automática con transportadoras para generación de guías.
- Envíos internacionales o fuera de Colombia.
- Flujo automatizado de devoluciones/reembolsos (se maneja manualmente por canal externo).

### Future Considerations
- Automatización de devoluciones/reembolsos dentro del sistema.
- Integración con transportadoras para generación de guías y tracking automático.
- Expansión de envíos a otros países de Latinoamérica.
- Programa de fidelización o referidos para clientes recurrentes.

## Clarifications Log
| # | Question | Answer | Date | Impact |
|---|----------|--------|------|--------|
| 1 | ¿Cómo se asigna el rol de administrador? | Flujo de invitación desde el propio panel admin (un admin invita a otro). | 2026-08-13 | Añadido FR-015; requiere endpoint/UI de invitación de admins. |
| 2 | ¿Qué ocurre cuando un producto se queda sin stock? | Se muestra en el catálogo marcado como "Agotado", sin poder comprarlo. | 2026-08-13 | Añadido FR-016; catálogo debe soportar estado agotado sin ocultar el producto. |
| 3 | ¿Valores meta específicos para las métricas de éxito? | Conversión ≥1.5% (3 meses) / 2.5% (1 año); abandono de carrito <70% (3 meses) / 60% (1 año); tráfico 1,000 visitantes/mes (3 meses) con crecimiento 20% mensual. | 2026-08-13 | SC-001, SC-002, SC-003 actualizados con metas numéricas. |
