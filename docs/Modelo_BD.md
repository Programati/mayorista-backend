# Modelo de datos: Distribuidora de bebidas mayoristas (MongoDB)

Convenciones:
- Todas las colecciones tienen `created`, `modified` y `modified_by`, salvo que se indique otra cosa.
- Excepción: las variantes son subdocumentos embebidos en `products` y no llevan `created`, `modified` ni `modified_by`; se usa el `modified` del producto.
- `modified_by` referencia a `users._id`.
- Los `_id` son ObjectId.
- Los precios son `Decimal128`.

---

## products

Las variantes van embebidas en el producto.

| Campo | Tipo | Ejemplo | Referencia |
|---|---|---|---|
| `_id` | ObjectId | `ObjectId("...aa")` | |
| `name` | string | `"Coca-Cola"` | |
| `brand_id` | ObjectId | `ObjectId("...d1")` | `brands._id` |
| `category_ids` | array de ObjectId | `[ObjectId("...b1")]` | `categories._id` |
| `variants` | array de objetos | ver abajo | embebido, mínimo 1 |
| `active` | bool | `true` | |

Cada elemento de `variants` (embebido en `products`):

| Campo | Tipo | Ejemplo | Referencia |
|---|---|---|---|
| `_id` | ObjectId | `ObjectId("...c1")` | lo genera la aplicación (`new ObjectId()`) |
| `measurement_unit_id` | ObjectId | `ObjectId("...e6a3")` | `measurement_units._id` |
| `packaging_id` | ObjectId | `ObjectId("...cajon8")` | `packagings._id` |
| `sku` | string | `"COC-VID-15-C8"` | |
| `purchase_price` | Decimal128 | `NumberDecimal("900.00")` | |
| `wholesale_price` | Decimal128 | `NumberDecimal("11000.00")` | precio por empaquetado (un cajón de 8, un pack de 6, o una unidad) |
| `active` | bool | `true` | |

Reglas de unicidad:
- `variants.sku` es único entre productos (índice único multikey).
- Dentro de un mismo producto, no puede haber dos variantes con el mismo SKU ni con la misma combinación `measurement_unit_id` + `packaging_id`. Ningún índice lo garantiza: lo valida el dominio.

## brands

| Campo | Tipo | Ejemplo |
|---|---|---|
| `_id` | ObjectId | `ObjectId("...d1")` |
| `name` | string | `"Coca-Cola Company"` |
| `active` | bool | `true` |

## categories

Sin `active`: se eliminan de verdad (ver `REGLAS_NEGOCIO.md`).

| Campo | Tipo | Ejemplo |
|---|---|---|
| `_id` | ObjectId | `ObjectId("...b1")` |
| `name` | string | `"Gaseosas"` |
| `slug` | string | `"gaseosas"` |

## container_types

| Campo | Tipo | Ejemplo |
|---|---|---|
| `_id` | ObjectId | `ObjectId("...e8a1")` |
| `name` | string | `"Vidrio retornable"` |
| `returnable` | bool | `true` |
| `active` | bool | `true` |

## measurement_units

| Campo | Tipo | Ejemplo | Referencia |
|---|---|---|---|
| `_id` | ObjectId | `ObjectId("...e6a3")` | |
| `volume_ml` | int | `1500` | |
| `container_type_id` | ObjectId | `ObjectId("...e8a1")` | `container_types._id` |
| `active` | bool | `true` | |

## packagings

| Campo | Tipo | Ejemplo |
|---|---|---|
| `_id` | ObjectId | `ObjectId("...b1")` |
| `name` | string | `"Cajón de 8"` |
| `units` | int | `8` |
| `active` | bool | `true` |

Para la venta individual se usa `"Unit"` con `units: 1`.

## stock

Un documento por producto + medida. Sin `created`. El stock se guarda en **unidades sueltas**; los cajones + sueltas se calculan al mostrar y al cargar el conteo físico.

| Campo | Tipo | Ejemplo | Referencia |
|---|---|---|---|
| `_id` | ObjectId | `ObjectId("...a1")` | |
| `product_id` | ObjectId | `ObjectId("...aa")` | `products._id` |
| `measurement_unit_id` | ObjectId | `ObjectId("...e6a3")` | `measurement_units._id` |
| `units` | int | `242` | unidades sueltas totales, mínimo 0 |
| `modified` | date | `ISODate("2026-10-29T00:12:00Z")` | |
| `modified_by` | ObjectId | `ObjectId("...f7")` | `users._id` |

Conversiones (las hace el servidor):
- Para mostrar: con un empaquetado de 8, 242 unidades son 30 cajones + 2 sueltas (`floor(242 ÷ 8)` y `242 mod 8`).
- Para cargar el conteo físico: `units = boxes × packagings.units + loose`.

## users

| Campo | Tipo | Ejemplo |
|---|---|---|
| `_id` | ObjectId | `ObjectId("...f7")` |
| `name` | string | `"Almacén Don Pepe"` |
| `email` | string | `"pepe@almacen.com"` |
| `password_hash` | string | `"$2b$10$N9qo8uLOickgx2ZMRZoMye..."` |
| `role` | string | `"customer"` (`customer`, `admin`) |
| `active` | bool | `true` |

## orders

El pedido nace `confirmed`, con el stock ya descontado. Solo puede pasar a `cancelled`, y entonces el stock vuelve. Quién canceló y cuándo queda en `modified_by` y `modified`.

| Campo | Tipo | Ejemplo | Referencia |
|---|---|---|---|
| `_id` | ObjectId | `ObjectId("...f8")` | |
| `user_id` | ObjectId | `ObjectId("...f7")` | `users._id` |
| `date` | date | `ISODate("2026-10-28T23:16:00Z")` | fecha de venta |
| `status` | string | `"confirmed"` (`confirmed`, `cancelled`) | |
| `total` | Decimal128 | `NumberDecimal("45000.00")` | |
| `items` | array de objetos | ver abajo | embebido |

Cada elemento de `items` es de uno de dos tipos, según `type`.

### Item `standard` (cajones o packs completos de una variante)

| Campo | Tipo | Ejemplo | Nota |
|---|---|---|---|
| `type` | string | `"standard"` | |
| `variant_id` | ObjectId | `ObjectId("...c1")` | referencia de consulta, `products.variants[]._id` |
| `product_id` | ObjectId | `ObjectId("...aa")` | copiado; sirve para devolver el stock al cancelar |
| `measurement_unit_id` | ObjectId | `ObjectId("...e6a3")` | copiado |
| `sku` | string | `"COC-VID-15-C8"` | copiado |
| `name` | string | `"Coca-Cola 1,5 L vidrio Cajón de 8"` | copiado |
| `quantity` | int | `3` | cantidad de empaquetados |
| `units` | int | `24` | unidades sueltas a descontar; lo calcula el servidor (`quantity × packaging.units`) |
| `unit_price` | Decimal128 | `NumberDecimal("11000.00")` | copiado de `wholesale_price`, por empaquetado |
| `subtotal` | Decimal128 | `NumberDecimal("33000.00")` | `quantity × unit_price` |

### Item `mixed` (un empaquetado armado con productos distintos)

| Campo | Tipo | Ejemplo | Nota |
|---|---|---|---|
| `type` | string | `"mixed"` | |
| `packaging_id` | ObjectId | `ObjectId("...cajon8")` | `packagings._id` |
| `packaging_name` | string | `"Cajón de 8"` | copiado |
| `units` | int | `8` | copiado de `packagings.units`; la suma de las líneas debe dar exactamente este valor |
| `measurement_unit_id` | ObjectId | `ObjectId("...e6a3")` | misma medida para todas las líneas |
| `lines` | array de objetos | ver abajo | mínimo 1 |
| `subtotal` | Decimal128 | `NumberDecimal("2750.00")` | `units × wholesale_price ÷ packagings.units`. El total suma estos subtotales |

Cada elemento de `lines`:

| Campo | Tipo | Ejemplo | Nota |
|---|---|---|---|
| `variant_id` | ObjectId | `ObjectId("...c2")` | variante de ese mismo empaquetado |
| `product_id` | ObjectId | `ObjectId("...ab")` | copiado |
| `sku` | string | `"FAN-VID-15-C8"` | copiado |
| `name` | string | `"Fanta 1,5 L vidrio Cajón de 8"` | copiado |
| `units` | int | `2` | unidades de este producto dentro del mixto |
| `unit_price` | Decimal128 | `NumberDecimal("1375.00")` | `wholesale_price ÷ packagings.units`, por unidad |

Reglas del mixto (las valida el dominio):
- La suma de `lines[].units` debe ser igual a `packagings.units`.
- Todas las líneas tienen la misma `measurement_unit_id` (mismo volumen y tipo de envase).
- Cada línea es una variante activa con el mismo `packaging_id` del item.
- El precio es el mismo que en una venta estándar; solo cambia la composición.

Cálculo del total:
- Item `standard`: `subtotal = quantity × unit_price`.
- Item `mixed`: `subtotal` de cada línea = `units × wholesale_price ÷ packagings.units`.
- `total` = suma de todos los `subtotal`: los de los items `standard` más los de cada línea de los items `mixed`.
- `unit_price` es informativo; el cálculo se hace siempre con `subtotal`.

---

## Resumen de relaciones

- `products.brand_id` → `brands._id`
- `products.category_ids[]` → `categories._id`
- `products.variants[].measurement_unit_id` → `measurement_units._id`
- `products.variants[].packaging_id` → `packagings._id`
- `container_types` ← `measurement_units.container_type_id`
- `stock.product_id` → `products._id`
- `stock.measurement_unit_id` → `measurement_units._id`
- `orders.user_id` → `users._id`
- `orders.items[].variant_id` → `products.variants[]._id`
- `orders.items[].product_id` → `products._id`
- `orders.items[].measurement_unit_id` → `measurement_units._id`
- `orders.items[].packaging_id` (solo `mixed`) → `packagings._id`
- `orders.items[].lines[].variant_id` → `products.variants[]._id`
- `orders.items[].lines[].product_id` → `products._id`
- `modified_by` → `users._id`
