# API REST: distribuidora de bebidas mayoristas (MVP)

Convenciones generales:

- Base: `/api`
- Autenticación: `Authorization: Bearer <token>`
- Acceso: **Público** (sin token), **Autenticado** (cualquier usuario logueado), **Admin** (rol `admin`)
- Errores comunes en todos los endpoints: `401` sin token o token inválido · `403` sin permisos · `404` recurso inexistente
- Las bajas son lógicas: `DELETE` marca `active: false` en lugar de borrar el documento. Excepción: las categorías no tienen `active`, su `DELETE` las elimina.

---

### Auth

| Operación         | Acceso      | Método y ruta             | Body de entrada                                                                        | Respuesta de éxito                                                                                                          | Errores posibles                                                               |
| ----------------- | ----------- | ------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Registrar usuario | Público     | `POST /api/auth/register` | `{ "email", "password", "name" }` (todos obligatorios; `password` mínimo 8 caracteres) | `201 Created` + `{ "token", "user" }` (`user`: `id`, `email`, `name`, `role`). Siempre crea un `customer` y queda autenticado | `400` body inválido o campos faltantes/incorrectos · `409` email ya registrado |
| Iniciar sesión    | Público     | `POST /api/auth/login`    | `{ "email", "password" }` (ambos obligatorios)                                         | `200 OK` + `{ "token", "user" }`                                                                                            | `400` body inválido · `401` credenciales incorrectas                           |
| Obtener mi perfil | Autenticado | `GET /api/auth/me`        | —                                                                                      | `200 OK` + usuario                                                                                                          | —                                                                              |

---

### Usuarios (`users`)

| Operación          | Acceso | Método y ruta           | Body de entrada                                          | Respuesta de éxito                       | Errores posibles                           |
| ------------------ | ------ | ----------------------- | -------------------------------------------------------- | ---------------------------------------- | ------------------------------------------ |
| Listar usuarios    | Admin  | `GET /api/users`        | — (query: `page`, `limit`, `role`, `active`)             | `200 OK` + lista paginada                | `401` · `403`                              |
| Obtener un usuario | Admin  | `GET /api/users/:id`    | —                                                        | `200 OK` + usuario (sin `password_hash`) | `404` no existe                            |
| Crear usuario      | Admin  | `POST /api/users`       | `{ "email", "password", "name", "role" }`                | `201 Created` + usuario                  | `400` inválido · `409` email ya registrado |
| Actualizar usuario | Admin  | `PATCH /api/users/:id`  | Campos parciales: `name`, `role`, `active`               | `200 OK` + usuario                       | `400` inválido · `404` no existe           |
| Dar de baja        | Admin  | `DELETE /api/users/:id` | —                                                        | `200 OK` (`active: false`)               | `404` no existe                            |

---

### Marcas (`brands`)

| Operación        | Acceso  | Método y ruta            | Body de entrada                  | Respuesta de éxito         | Errores posibles                                |
| ---------------- | ------- | ------------------------ | -------------------------------- | -------------------------- | ----------------------------------------------- |
| Listar marcas    | Público | `GET /api/brands`        | — (query: `active`)              | `200 OK` + lista           | —                                               |
| Obtener marca    | Público | `GET /api/brands/:id`    | —                                | `200 OK` + marca           | `404` no existe                                 |
| Crear marca      | Admin   | `POST /api/brands`       | `{ "name" }`                     | `201 Created` + marca      | `400` inválido · `401` · `403`                  |
| Actualizar marca | Admin   | `PATCH /api/brands/:id`  | `{ "name", "active" }` (parcial) | `200 OK` + marca           | `400` inválido · `404` no existe                |
| Dar de baja      | Admin   | `DELETE /api/brands/:id` | —                                | `200 OK` (`active: false`) | `404` no existe · `409` tiene productos activos |

---

### Categorías (`categories`)

| Operación            | Acceso  | Método y ruta                | Body de entrada                | Respuesta de éxito        | Errores posibles                          |
| -------------------- | ------- | ---------------------------- | ------------------------------ | ------------------------- | ----------------------------------------- |
| Listar categorías    | Público | `GET /api/categories`        | —                              | `200 OK` + lista          | —                                         |
| Obtener categoría    | Público | `GET /api/categories/:id`    | —                              | `200 OK` + categoría      | `404` no existe                           |
| Crear categoría      | Admin   | `POST /api/categories`       | `{ "name", "slug" }`           | `201 Created` + categoría | `400` inválido · `409` slug repetido      |
| Actualizar categoría | Admin   | `PATCH /api/categories/:id`  | `{ "name", "slug" }` (parcial) | `200 OK` + categoría      | `400` · `404` · `409` slug repetido       |
| Eliminar categoría   | Admin   | `DELETE /api/categories/:id` | —                              | `204 No Content`          | `404` no existe · `409` la usan productos |

---

### Tipos de envase (`container_types`)

| Operación         | Acceso  | Método y ruta                     | Body de entrada                                | Respuesta de éxito         | Errores posibles                       |
| ----------------- | ------- | --------------------------------- | ---------------------------------------------- | -------------------------- | -------------------------------------- |
| Listar envases    | Público | `GET /api/container-types`        | —                                              | `200 OK` + lista           | —                                      |
| Obtener envase    | Público | `GET /api/container-types/:id`    | —                                              | `200 OK` + envase          | `404` no existe                        |
| Crear envase      | Admin   | `POST /api/container-types`       | `{ "name", "returnable" }`                     | `201 Created` + envase     | `400` inválido                         |
| Actualizar envase | Admin   | `PATCH /api/container-types/:id`  | `{ "name", "returnable", "active" }` (parcial) | `200 OK` + envase          | `400` · `404`                          |
| Dar de baja       | Admin   | `DELETE /api/container-types/:id` | —                                              | `200 OK` (`active: false`) | `404` · `409` tiene unidades de medida |

---

### Unidades de medida (`measurement_units`)

| Operación         | Acceso  | Método y ruta                       | Body de entrada                                         | Respuesta de éxito         | Errores posibles                                            |
| ----------------- | ------- | ----------------------------------- | ------------------------------------------------------- | -------------------------- | ----------------------------------------------------------- |
| Listar medidas    | Público | `GET /api/measurement-units`        | — (query: `containerTypeId`)                            | `200 OK` + lista           | —                                                           |
| Obtener medida    | Público | `GET /api/measurement-units/:id`    | —                                                       | `200 OK` + medida          | `404` no existe                                             |
| Crear medida      | Admin   | `POST /api/measurement-units`       | `{ "volumeMl", "containerTypeId" }`                     | `201 Created` + medida     | `400` inválido · `409` ya existe ese volumen con ese envase |
| Actualizar medida | Admin   | `PATCH /api/measurement-units/:id`  | `{ "volumeMl", "containerTypeId", "active" }` (parcial) | `200 OK` + medida          | `400` · `404` · `409`                                       |
| Dar de baja       | Admin   | `DELETE /api/measurement-units/:id` | —                                                       | `200 OK` (`active: false`) | `404` · `409` la usan variantes                             |

---

### Empaquetados (`packagings`)

| Operación              | Acceso  | Método y ruta                | Body de entrada                           | Respuesta de éxito          | Errores posibles                       |
| ---------------------- | ------- | ---------------------------- | ----------------------------------------- | --------------------------- | -------------------------------------- |
| Listar empaquetados    | Público | `GET /api/packagings`        | —                                         | `200 OK` + lista            | —                                      |
| Obtener empaquetado    | Público | `GET /api/packagings/:id`    | —                                         | `200 OK` + empaquetado      | `404` no existe                        |
| Crear empaquetado      | Admin   | `POST /api/packagings`       | `{ "name", "units" }`                     | `201 Created` + empaquetado | `400` inválido · `409` nombre repetido |
| Actualizar empaquetado | Admin   | `PATCH /api/packagings/:id`  | `{ "name", "units", "active" }` (parcial) | `200 OK` + empaquetado      | `400` · `404` · `409`                  |
| Dar de baja            | Admin   | `DELETE /api/packagings/:id` | —                                         | `200 OK` (`active: false`)  | `404` · `409` la usan variantes        |

---

### Productos (`products`, con variantes embebidas)

| Operación           | Acceso  | Método y ruta                 | Body de entrada                                                                                                                            | Respuesta de éxito                                                                | Errores posibles                                                                                                            |
| ------------------- | ------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Listar productos    | Público | `GET /api/products`           | — (query: `brandId`, `categoryId`, `page`, `limit`, `active`)                                                                              | `200 OK` + lista paginada                                                         | —                                                                                                                           |
| Obtener producto    | Público | `GET /api/products/:id`       | —                                                                                                                                          | `200 OK` + producto con `variants`                                                | `404` no existe                                                                                                             |
| Formulario de alta  | Admin   | `GET /api/products/form-data` | —                                                                                                                                          | `200 OK` + `{ brands, categories, measurementUnits, packagings, containerTypes }` | `401` · `403`                                                                                                               |
| Crear producto      | Admin   | `POST /api/products`          | `{ "name", "brandId", "categoryIds": [], "variants": [{ "measurementUnitId", "packagingId", "sku", "purchasePrice", "wholesalePrice" }] }` | `201 Created` + producto                                                          | `400` inválido · `404` marca/categoría/medida/empaque inexistente · `409` SKU repetido o combinación medida+empaque repetida |
| Actualizar producto | Admin   | `PATCH /api/products/:id`     | `{ "name", "brandId", "categoryIds", "active" }` (parcial, sin variantes)                                                                  | `200 OK` + producto                                                               | `400` · `404` · `409`                                                                                                       |
| Dar de baja         | Admin   | `DELETE /api/products/:id`    | —                                                                                                                                          | `200 OK` (`active: false`)                                                        | `404` no existe                                                                                                             |

---

### Variantes (subrecurso de `products`)

El servidor genera el `_id` de cada variante.

| Operación            | Acceso  | Método y ruta                                  | Body de entrada                                                                    | Respuesta de éxito         | Errores posibles                                 |
| -------------------- | ------- | ---------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------ |
| Listar variantes     | Público | `GET /api/products/:id/variants`               | —                                                                                  | `200 OK` + lista           | `404` producto no existe                         |
| Agregar variante     | Admin   | `POST /api/products/:id/variants`              | `{ "measurementUnitId", "packagingId", "sku", "purchasePrice", "wholesalePrice" }` | `201 Created` + variante   | `400` · `404` · `409` SKU o combinación repetida |
| Actualizar variante  | Admin   | `PATCH /api/products/:id/variants/:variantId`  | Campos parciales de la variante, incluido `active`                                 | `200 OK` + variante        | `400` · `404` · `409`                            |
| Dar de baja variante | Admin   | `DELETE /api/products/:id/variants/:variantId` | —                                                                                  | `200 OK` (`active: false`) | `404`                                            |

---

### Stock (`stock`)

Un documento por par producto + medida. El stock se guarda en **unidades sueltas** (`units`). El servidor convierte desde y hacia cajones + sueltas.

| Operación            | Acceso | Método y ruta                                  | Body de entrada                             | Respuesta de éxito                                                                                                                   | Errores posibles                                                           |
| -------------------- | ------ | ---------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Listar stock         | Admin  | `GET /api/stock`                               | — (query: `productId`, `measurementUnitId`) | `200 OK` + lista (cada elemento con `units` y el desglose en cajones + sueltas para cada empaquetado de las variantes del producto)  | `401` · `403`                                                              |
| Stock de un producto | Admin  | `GET /api/products/:id/stock`                  | —                                           | `200 OK` + stock por medida, con `units` y desglose                                                                                  | `404` producto no existe                                                   |
| Fijar stock          | Admin  | `PUT /api/stock/:productId/:measurementUnitId` | `{ "packagingId", "boxes", "loose" }`       | `200 OK` + stock. El servidor calcula `units = boxes × packaging.units + loose`                                                      | `400` cantidad negativa · `404` producto, medida o empaquetado inexistente |

---

### Pedidos (`orders`)

El carrito vive en el frontend. El backend ofrece una **previsualización** para validar y cotizar el carrito, y un endpoint para **confirmar** (crear) el pedido.

Un pedido tiene dos tipos de item:

- **`standard`:** cajones o packs completos de una variante. El cliente envía `variantId` y `quantity`; el servidor calcula `units`.
- **`mixed`:** un empaquetado armado con unidades de varios productos. El cliente envía el `packagingId` y las `lines` (`variantId` + `units`).

Reglas del item `mixed` (las valida el servidor):

- La suma de `units` de las líneas debe ser igual a `packaging.units` (8 en un cajón de 8).
- Todas las líneas deben ser del mismo volumen y tipo de envase (misma medida).
- Cada línea debe ser una variante activa de ese mismo empaquetado.
- Precio: el de la variante, igual que en una venta estándar. En un mixto el precio por unidad es `wholesalePrice ÷ packaging.units`, y el subtotal de cada línea es `units × wholesalePrice ÷ packaging.units`, sin redondear.

Estados: `confirmed` y `cancelled`. El pedido nace `confirmed`, con el stock ya descontado. Al cancelarlo, el stock vuelve.

Los items van embebidos y guardan una copia de `sku`, `name` y precio al momento de la compra. Esa copia es intencional: el pedido no debe cambiar si el producto cambia después. Cada item `standard` y cada línea de un `mixed` tienen su `subtotal`, y el `total` lo calcula el servidor como suma de esos subtotales.

Ejemplo de body (el mismo para previsualizar y confirmar):

```json
{
  "items": [
    { "type": "standard", "variantId": "...", "quantity": 3 },
    { "type": "mixed", "packagingId": "...", "lines": [
      { "variantId": "...", "units": 2 },
      { "variantId": "...", "units": 2 },
      { "variantId": "...", "units": 4 }
    ] }
  ]
}
```

| Operación                | Acceso        | Método y ruta                 | Body de entrada                                                                                                                              | Respuesta de éxito                                                                                                                                                                                                                                                                                                              | Errores posibles                                                                                                                                                       |
| ------------------------ | ------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Previsualizar pedido     | Autenticado   | `POST /api/orders/preview`    | `{ "items": [ { "type": "standard", "variantId", "quantity" } \| { "type": "mixed", "packagingId", "lines": [{ "variantId", "units" }] } ] }` | `200 OK` + `{ "valid", "order", "errors" }`. `order` es el pedido calculado: items con copias de datos, `unit_price` (informativo), `subtotal` por item standard y por línea de mixto, y `total`. `errors` lista los problemas por item (`itemIndex`, `code`, `message`). No crea nada ni toca el stock | `400` body mal formado                                                                                                                                                 |
| Confirmar pedido (crear) | Autenticado   | `POST /api/orders`            | Igual que la previsualización                                                                                                                | `201 Created` + pedido en estado `confirmed`, con el stock ya descontado                                                                                                                                                                                                                                                         | `400` body mal formado · `422` + `{ "errors" }` si alguna regla falla (variante inexistente o inactiva, sin stock, mixto inválido). No se descuenta nada             |
| Listar todos             | Admin         | `GET /api/orders`             | — (query: `status`, `userId`, `from`, `to`, `page`, `limit`)                                                                                 | `200 OK` + lista paginada                                                                                                                                                                                                                                                                                                       | `401` · `403`                                                                                                                                                          |
| Mis pedidos              | Autenticado   | `GET /api/orders/mine`        | — (query: `status`, `page`, `limit`)                                                                                                         | `200 OK` + lista paginada                                                                                                                                                                                                                                                                                                       | `401`                                                                                                                                                                  |
| Obtener pedido           | Dueño o Admin | `GET /api/orders/:id`         | —                                                                                                                                            | `200 OK` + pedido                                                                                                                                                                                                                                                                                                               | `403` pedido de otro usuario · `404`                                                                                                                                   |
| Cancelar pedido          | Dueño o Admin | `POST /api/orders/:id/cancel` | —                                                                                                                                            | `200 OK` + pedido en estado `cancelled`, con el stock devuelto                                                                                                                                                                                                                                                                  | `403` pedido de otro usuario (siendo cliente) · `404` · `409` el pedido ya está cancelado                                                                              |

Códigos de `errors` (ejemplos): `VARIANT_NOT_FOUND`, `VARIANT_INACTIVE`, `INSUFFICIENT_STOCK`, `MIXED_SUM_MISMATCH`, `MIXED_MEASUREMENT_MISMATCH`.

Cuando el cliente confirma, el servidor vuelve a validar todo en ese momento exacto: la previsualización es una ayuda para el carrito, no una garantía.
