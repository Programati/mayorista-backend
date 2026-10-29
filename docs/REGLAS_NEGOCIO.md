# Reglas de negocio: distribuidora de bebidas mayoristas (MVP)

Fuente de verdad de las decisiones de negocio. Si otro documento contradice este, se corrige el otro.
Las reglas viven en `domain` o `application`, no en los controladores ni en la base.

Alcance del MVP: el cliente arma su carrito, confirma el pedido y puede cancelarlo. El admin ve los pedidos y puede cancelar en casos especiales.

Terminología:
- **Unidad suelta:** una botella o lata individual. Es la unidad base del stock.
- **Empaquetado (packaging):** forma de agrupar unidades (cajón de 8, pack de 6, de 24, de 4, o "Unit" = 1). Define `units`.
- **Variante:** producto + medida + empaquetado, con su SKU y sus precios. Va embebida en el producto.
- **Medida:** volumen + tipo de envase (`measurement_units`).

---

## 1. Usuarios

- Dos roles: `customer` y `admin`.
- El registro público siempre crea un usuario `customer`. Solo un admin puede crear otro admin.
- El nombre del usuario es un único campo `name`.
- El email es único.
- Las bajas son lógicas (`active: false`); nunca se borra un documento. Única excepción: las categorías (ver sección 2).
- Solo se guarda quién modificó por última vez (`modified_by`).
- El primer administrador se crea sin quién lo modificó, por eso `users.modified_by` acepta `null`.

## 2. Catálogo

- Las bajas son lógicas y no se puede dar de baja algo que está en uso:
  - Marca con productos activos → `409`.
  - Tipo de envase con unidades de medida → `409`.
  - Medida o empaquetado usados por variantes → `409`.
- **Excepción:** las categorías no tienen `active`. `DELETE` las elimina de verdad, y si las usan productos devuelve `409`.
- `slug` de categoría único. Nombre de empaquetado único.
- Una medida es única por volumen + tipo de envase.
- La venta individual usa el empaquetado `"Unit"` con `units: 1`.

## 3. Productos y variantes

- Las variantes están **embebidas** en el producto (mínimo 1). El servidor genera el `_id` de cada una.
- El SKU es único en todo el sistema. Dentro de un mismo producto, no puede repetirse la combinación medida + empaquetado. Esto lo valida el dominio, porque ningún índice lo garantiza dentro de un array.
- Al crear o editar un producto deben existir la marca, las categorías, las medidas y los empaquetados referenciados.
- `wholesale_price` es el precio **por empaquetado** (el cajón, el pack, o la unidad).
- Una variante inactiva no se puede vender.

## 4. Stock

- El stock se guarda **en unidades sueltas**, un documento por producto + medida (`stock.units`, mínimo 0).
- Los cajones + sueltas se **calculan**, no se guardan:
  - Para mostrar: `cajones = floor(units ÷ packaging.units)` y `sueltas = units mod packaging.units`. Ejemplo: 242 unidades en cajón de 8 son 30 cajones + 2 sueltas.
  - Para cargar el conteo físico: `units = boxes × packaging.units + loose`.
- El conteo físico se informa por empaquetado (cajones + sueltas) para que sea más rápido que contar de a una, y el servidor lo convierte a unidades.
- El stock nunca puede quedar negativo.

## 5. Carrito

- El carrito vive **solo en el frontend**. El backend no lo guarda.
- Mientras el cliente lo arma, el stock no se toca.
- Para mostrar totales y errores mientras lo arma, el front llama a `POST /api/orders/preview`. El servidor valida las mismas reglas que al confirmar y calcula precios y total, pero no crea nada ni toca el stock.
- El front nunca calcula precios ni totales por su cuenta.

## 6. Pedidos

### Tipos de item

Un pedido tiene uno o más items. Cada item es `standard` o `mixed`.

**Item `standard`:** cajones o packs completos de una variante.
- El cliente envía `variantId` y `quantity`.
- El servidor calcula `units = quantity × packaging.units`. El cliente nunca envía `units` en este tipo.

**Item `mixed`:** un empaquetado armado con unidades de varios productos.
- El cliente envía el `packagingId` y las `lines` (`variantId` + `units` de cada una).
- Ejemplo: un cajón de 8 con 2 Fanta + 2 Sprite + 4 Coca-Cola. Se aplica a cualquier empaquetado (de 4, 6, 24, etc.).
- Reglas:
  1. La suma de `units` de las líneas debe ser **exactamente** `packaging.units`. El empaquetado siempre se completa.
  2. Todas las líneas deben tener la misma medida (mismo volumen y tipo de envase).
  3. Cada línea debe ser una variante **activa** de ese mismo empaquetado.
  4. Un pedido puede combinar items estándar y mixtos, y puede tener varios mixtos.
  
### Precios y total

- Cada línea (y cada item standard) guarda subtotal, el total es la suma de los subtotales. unit_price es informativo.
- Item `standard`: `unit_price = wholesale_price` de la variante (por empaquetado). Subtotal = `quantity × unit_price`.
- Item `mixed`: cada línea usa `unit_price = wholesale_price ÷ packaging.units` (por unidad) de la variante de ese empaquetado. Subtotal = suma de `units × unit_price` de cada línea.
- Vender mixto **no cambia el precio**: un cajón mixto cuesta lo mismo que uno estándar si los productos valen igual. Solo cambia la composición.
- El servidor calcula el `total`. El cliente nunca lo envía.
- El pedido guarda una **copia** de `sku`, `name`, precios, `product_id` y `measurement_unit_id`. Esa copia es intencional: el pedido no cambia si el producto cambia después.

### Estados

- Solo hay dos estados: `confirmed` y `cancelled`.
- El pedido **nace `confirmed`**: no existe un estado pendiente.
- Única transición: `confirmed → cancelled`. Un pedido `cancelled` no cambia más (`409` si se intenta cancelar de nuevo).
- No hay estado de entrega en el MVP.

## 7. Confirmar el pedido (crear)

- Lo hace el **cliente** desde el front: `POST /api/orders`.
- El servidor **revalida todo en ese momento exacto**: variantes existentes y activas, mixtos válidos y stock disponible.
- Qué se descuenta: se suman las unidades por producto + medida entre todos los items (los estándar aportan `units` y los mixtos aportan las `units` de cada línea). Un mismo producto puede aparecer en varios items.
- Es **todo o nada**: si algún producto no alcanza o alguna regla falla, no se descuenta nada, no se crea el pedido y se responde `422` con la lista de items que fallaron.
- Descontar el stock y crear el pedido ocurren de forma **atómica** (una transacción), para que dos pedidos simultáneos no dejen el stock en negativo.

## 8. Cancelar el pedido

- Puede cancelar el **dueño del pedido** o un **admin**. El admin lo usa en casos especiales, cuando pasó algo.
- Solo se cancela un pedido `confirmed`.
- Al cancelar, las unidades de cada item **vuelven al stock** (las mismas que se descontaron, según los datos copiados en el pedido).
- El cambio de estado y la devolución del stock ocurren de forma **atómica**: cancelar dos veces nunca devuelve el stock dos veces.
- Quién canceló y cuándo queda en `modified_by` y `modified` del pedido.

## 9. Permisos de pedidos

- Cliente: ver, confirmar y cancelar **sus** pedidos.
- Admin: ver todos y cancelar cualquiera. No crea pedidos ni cambia otros estados.

## 10. Convención de nombres

- No se da importancia a cómo están escritos los nombres en el contexto (camelCase, snake_case, UPPERCASE, PascalCase, etc.). Al proponer nombres nuevos, se decide la convención más adecuada en cada caso, sin preguntar.

---

## Fuera del MVP (no se hace por ahora)

- Estados `pending` y `delivered`.
- Carrito guardado en el backend.
- Reserva de stock mientras se arma el carrito.
- Límite de tiempo para cancelar y devoluciones.
