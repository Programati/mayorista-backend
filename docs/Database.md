# Creación de la base de datos: distribuidora de bebidas mayoristas

Copiar el bloque completo y ejecutarlo en `mongosh` (o en la pestaña Shell de MongoDB Compass). Requiere MongoDB 6.0 o superior.

Nota: crear un pedido y cancelarlo usan transacciones (descuento y devolución de stock junto con el pedido). Las transacciones de MongoDB necesitan un replica set, incluso en desarrollo local (puede ser de un solo nodo).

```javascript
// ============================================================
// 1. Base de datos
// ============================================================
use beverage_distributor

// ============================================================
// 2. Colecciones con validación ($jsonSchema)
// ============================================================

db.createCollection("users", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["name", "email", "password_hash", "role", "active", "created", "modified"],
    properties: {
      name:          { bsonType: "string" },
      email:         { bsonType: "string" },
      password_hash: { bsonType: "string" },
      role:          { enum: ["customer", "admin"] },
      active:        { bsonType: "bool" },
      created:       { bsonType: "date" },
      modified:      { bsonType: "date" },
      modified_by:   { bsonType: ["objectId", "null"] }
    }
  } }
})

db.createCollection("brands", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["name", "active", "created", "modified"],
    properties: {
      name:        { bsonType: "string" },
      active:      { bsonType: "bool" },
      created:     { bsonType: "date" },
      modified:    { bsonType: "date" },
      modified_by: { bsonType: "objectId" }
    }
  } }
})

db.createCollection("categories", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["name", "slug", "created", "modified"],
    properties: {
      name:        { bsonType: "string" },
      slug:        { bsonType: "string" },
      created:     { bsonType: "date" },
      modified:    { bsonType: "date" },
      modified_by: { bsonType: "objectId" }
    }
  } }
})

db.createCollection("container_types", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["name", "returnable", "active", "created", "modified"],
    properties: {
      name:        { bsonType: "string" },
      returnable:  { bsonType: "bool" },
      active:      { bsonType: "bool" },
      created:     { bsonType: "date" },
      modified:    { bsonType: "date" },
      modified_by: { bsonType: "objectId" }
    }
  } }
})

db.createCollection("measurement_units", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["volume_ml", "container_type_id", "active", "created", "modified"],
    properties: {
      volume_ml:         { bsonType: "int", minimum: 1 },
      container_type_id: { bsonType: "objectId" },
      active:            { bsonType: "bool" },
      created:           { bsonType: "date" },
      modified:          { bsonType: "date" },
      modified_by:       { bsonType: "objectId" }
    }
  } }
})

db.createCollection("packagings", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["name", "units", "active", "created", "modified"],
    properties: {
      name:        { bsonType: "string" },
      units:       { bsonType: "int", minimum: 1 },
      active:      { bsonType: "bool" },
      created:     { bsonType: "date" },
      modified:    { bsonType: "date" },
      modified_by: { bsonType: "objectId" }
    }
  } }
})

// products: las variantes van EMBEBIDAS (array "variants").
// Cada variante necesita su propio _id: MongoDB no lo genera para
// subdocumentos de un array, lo crea la aplicación (new ObjectId()).
// Las variantes no llevan created/modified/modified_by: se usa el
// "modified" del producto.
db.createCollection("products", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["name", "brand_id", "category_ids", "variants", "active", "created", "modified"],
    properties: {
      name:         { bsonType: "string" },
      brand_id:     { bsonType: "objectId" },
      category_ids: { bsonType: "array", items: { bsonType: "objectId" }, minItems: 1 },
      variants: {
        bsonType: "array",
        minItems: 1,
        items: {
          bsonType: "object",
          required: ["_id", "measurement_unit_id", "packaging_id", "sku",
                     "purchase_price", "wholesale_price", "active"],
          properties: {
            _id:                  { bsonType: "objectId" },
            measurement_unit_id:  { bsonType: "objectId" },
            packaging_id:         { bsonType: "objectId" },
            sku:                  { bsonType: "string" },
            purchase_price:       { bsonType: "decimal" },
            wholesale_price:      { bsonType: "decimal" },
            active:               { bsonType: "bool" }
          }
        }
      },
      active:       { bsonType: "bool" },
      created:      { bsonType: "date" },
      modified:     { bsonType: "date" },
      modified_by:  { bsonType: "objectId" }
    }
  } }
})

// stock: un documento por producto + medida. Se guarda en UNIDADES SUELTAS.
// Los cajones + sueltas se calculan al mostrar y al cargar el conteo físico.
db.createCollection("stock", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["product_id", "measurement_unit_id", "units", "modified"],
    properties: {
      product_id:          { bsonType: "objectId" },
      measurement_unit_id: { bsonType: "objectId" },
      units:               { bsonType: "int", minimum: 0 },
      modified:            { bsonType: "date" },
      modified_by:         { bsonType: "objectId" }
    }
  } }
})

// orders: el pedido nace "confirmed" (con el stock ya descontado) y solo
// puede pasar a "cancelled" (con el stock devuelto).
// Quién canceló y cuándo queda en modified_by / modified.
// Cada item es "standard" (cajones completos de una variante) o "mixed"
// (un empaquetado armado con unidades de varios productos).
// Se usa oneOf: el item debe cumplir exactamente uno de los dos esquemas.
// subtotal: se guarda sin redondear; el total es la suma de subtotales.
db.createCollection("orders", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["user_id", "date", "status", "total", "items", "created", "modified"],
    properties: {
      user_id: { bsonType: "objectId" },
      date:    { bsonType: "date" },
      status:  { enum: ["confirmed", "cancelled"] },
      total:   { bsonType: "decimal" },
      items: {
        bsonType: "array",
        minItems: 1,
        items: {
          oneOf: [
            {
              bsonType: "object",
              required: ["type", "variant_id", "product_id", "measurement_unit_id",
                         "sku", "name", "quantity", "units", "unit_price", "subtotal"],
              properties: {
                type:                { enum: ["standard"] },
                variant_id:          { bsonType: "objectId" },
                product_id:          { bsonType: "objectId" },
                measurement_unit_id: { bsonType: "objectId" },
                sku:                 { bsonType: "string" },
                name:                { bsonType: "string" },
                quantity:            { bsonType: "int", minimum: 1 },
                units:               { bsonType: "int", minimum: 1 },
                unit_price:          { bsonType: "decimal" },
                subtotal:            { bsonType: "decimal" }
              }
            },
            {
              bsonType: "object",
              required: ["type", "packaging_id", "packaging_name", "units",
                         "measurement_unit_id", "lines"],
              properties: {
                type:                { enum: ["mixed"] },
                packaging_id:        { bsonType: "objectId" },
                packaging_name:      { bsonType: "string" },
                units:               { bsonType: "int", minimum: 1 },
                measurement_unit_id: { bsonType: "objectId" },
                lines: {
                  bsonType: "array",
                  minItems: 1,
                  items: {
                    bsonType: "object",
                    required: ["variant_id", "product_id", "sku", "name", "units", "unit_price", "subtotal"],
                    properties: {
                      variant_id: { bsonType: "objectId" },
                      product_id: { bsonType: "objectId" },
                      sku:        { bsonType: "string" },
                      name:       { bsonType: "string" },
                      units:      { bsonType: "int", minimum: 1 },
                      unit_price: { bsonType: "decimal" },
                      subtotal:   { bsonType: "decimal" }
                    }
                  }
                }
              }
            }
          ]
        }
      },
      created:     { bsonType: "date" },
      modified:    { bsonType: "date" },
      modified_by: { bsonType: "objectId" }
    }
  } }
})

// ============================================================
// 3. Índices
// ============================================================

// users: email único (login)
db.users.createIndex({ email: 1 }, { unique: true })

// categories: slug único
db.categories.createIndex({ slug: 1 }, { unique: true })

// measurement_units: una sola entrada por volumen y tipo de envase
db.measurement_units.createIndex({ volume_ml: 1, container_type_id: 1 }, { unique: true })

// packagings: nombre único
db.packagings.createIndex({ name: 1 }, { unique: true })

// products: búsqueda por marca y categoría
db.products.createIndex({ brand_id: 1 })
db.products.createIndex({ category_ids: 1 })

// products (variantes embebidas):
// - SKU único entre productos distintos (índice multikey). Dentro de un
//   mismo producto, el dominio valida que el SKU no se repita.
// - La regla "una variante por producto + medida + empaque" tampoco la
//   puede imponer un índice: la valida el dominio (CombinacionDuplicada).
db.products.createIndex({ "variants.sku": 1 }, { unique: true })
// - Buscar una variante por _id (pedidos y previsualización)
db.products.createIndex({ "variants._id": 1 })
// - Para los 409 al dar de baja medidas o empaques que usan variantes
db.products.createIndex({ "variants.measurement_unit_id": 1 })
db.products.createIndex({ "variants.packaging_id": 1 })

// stock: un documento por producto + medida
db.stock.createIndex({ product_id: 1, measurement_unit_id: 1 }, { unique: true })

// orders: historial por usuario y por fecha
db.orders.createIndex({ user_id: 1, date: -1 })
db.orders.createIndex({ status: 1 })

// ============================================================
// 4. Verificación
// ============================================================
db.getCollectionNames()
```
