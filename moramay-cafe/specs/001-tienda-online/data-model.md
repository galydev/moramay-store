<!-- SDD Artifact | Version: 1.0 | Phase: Plan | Updated: 2026-08-13 -->
<!-- Project: Moramay Café | Feature: 001-tienda-online -->

# Data Model: Tienda Online Moramay Café

## customers
Representa a un cliente de la tienda (creado manualmente al registrarse o automáticamente tras compra invitado).
| Field | Meaning |
|-------|---------|
| id | Identificador único, vinculado al usuario de Supabase Auth |
| full_name | Nombre completo del cliente |
| email | Correo electrónico (único) |
| national_id | Cédula del cliente |
| phone | Teléfono de contacto |
| billing_address | Dirección de facturación |
| shipping_address | Dirección de envío por defecto |
| city | Ciudad (usada para calcular tarifa de envío) |
| created_via | Cómo se creó la cuenta: `self_registered` \| `guest_checkout` |
| created_at / updated_at | Marcas de tiempo |

## admins
Representa a un administrador con acceso al panel.
| Field | Meaning |
|-------|---------|
| id | Identificador único, vinculado al usuario de Supabase Auth |
| full_name | Nombre completo |
| email | Correo electrónico (único) |
| invited_by | ID del administrador que lo invitó (nullable para el primer admin) |
| status | `invited` \| `active` \| `revoked` |
| created_at | Fecha de invitación/creación |

## products
Representa un artículo vendible (café o merch).
| Field | Meaning |
|-------|---------|
| id | Identificador único |
| category | `coffee` \| `merch` |
| name | Nombre del producto |
| description | Descripción y características |
| origin | Origen/finca (trazabilidad, solo café) |
| roast_date | Fecha de tueste (trazabilidad, solo café) |
| lot_number | Número de lote (trazabilidad, solo café) |
| base_price | Precio base |
| status | `active` \| `inactive` |
| created_at / updated_at | Marcas de tiempo |

## product_variants
Representa una presentación específica de un producto (peso/molienda para café, talla/color para merch).
| Field | Meaning |
|-------|---------|
| id | Identificador único |
| product_id | Relación a `products` |
| weight | Peso: `250g` \| `340g` (solo café, nullable en merch) |
| grind_type | Molienda: `whole_bean` \| `fine` \| `medium` \| `coarse` (nullable en merch) |
| attribute_label | Atributo genérico para merch (ej. talla, color) |
| price | Precio de esta variante (puede diferir del base) |
| stock_quantity | Cantidad disponible |
| stock_status | `in_stock` \| `out_of_stock` (derivado de stock_quantity, mostrado como "Agotado") |

## orders
Representa un pedido realizado por un cliente.
| Field | Meaning |
|-------|---------|
| id | Identificador único (número de orden visible al cliente) |
| customer_id | Relación a `customers` (creado automáticamente si fue invitado) |
| status | `pending` \| `paid` \| `shipped` \| `delivered` \| `cancelled` |
| subtotal | Suma de los ítems |
| shipping_cost | Costo de envío calculado según ciudad |
| total | subtotal + shipping_cost |
| shipping_city | Ciudad de destino |
| shipping_address | Dirección de entrega |
| payment_reference | Referencia de la transacción en Wompi |
| placed_as_guest | Booleano — indica si se creó como invitado |
| created_at / updated_at | Marcas de tiempo |

## order_items
Ítems que componen un pedido.
| Field | Meaning |
|-------|---------|
| id | Identificador único |
| order_id | Relación a `orders` |
| product_variant_id | Relación a `product_variants` |
| quantity | Cantidad comprada |
| unit_price | Precio unitario al momento de la compra |

## subscriptions
Representa una suscripción mensual de un cliente a uno o varios productos.
| Field | Meaning |
|-------|---------|
| id | Identificador único |
| customer_id | Relación a `customers` |
| status | `active` \| `paused` \| `cancelled` \| `pending_confirmation` |
| billing_mode | `automatic` \| `manual_confirmation` |
| frequency | `monthly` (fijo en este MVP) |
| next_billing_date | Próxima fecha de cobro/notificación |
| payment_source_reference | Referencia del método de pago tokenizado en Wompi (para cobro automático) |
| created_at / updated_at | Marcas de tiempo |

## subscription_items
Productos incluidos en una suscripción.
| Field | Meaning |
|-------|---------|
| id | Identificador único |
| subscription_id | Relación a `subscriptions` |
| product_variant_id | Relación a `product_variants` |
| quantity | Cantidad mensual |

## subscription_billing_history
Historial de cobros de una suscripción.
| Field | Meaning |
|-------|---------|
| id | Identificador único |
| subscription_id | Relación a `subscriptions` |
| billed_at | Fecha del intento de cobro |
| amount | Monto cobrado |
| result | `success` \| `failed` \| `awaiting_manual_confirmation` |
| payment_reference | Referencia de la transacción en Wompi (si aplica) |

## shipping_rates
Tarifas de envío configurables por ciudad.
| Field | Meaning |
|-------|---------|
| id | Identificador único |
| city | Nombre de la ciudad (o `default` para "otras ciudades") |
| rate | Costo de envío |
| updated_at | Última actualización (gestionada desde panel admin) |

## return_requests
Solicitud de devolución/reclamación asociada a un pedido.
| Field | Meaning |
|-------|---------|
| id | Identificador único |
| order_id | Relación a `orders` |
| channel | `site_button` \| `whatsapp` \| `email` |
| reason | Motivo reportado por el cliente |
| status | `open` \| `in_review` \| `resolved` |
| created_at | Fecha de la solicitud |

## Relationships
- `products` 1—N `product_variants`
- `customers` 1—N `orders`, 1—N `subscriptions`
- `orders` 1—N `order_items` → `product_variants`
- `subscriptions` 1—N `subscription_items` → `product_variants`
- `subscriptions` 1—N `subscription_billing_history`
- `orders` 1—N `return_requests` (0 o 1 esperado por pedido en este MVP)
- `admins` self-reference vía `invited_by`
