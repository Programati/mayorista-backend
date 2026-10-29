# Estructura de carpetas: arquitectura hexagonal

Regla principal: las dependencias apuntan hacia adentro. `domain` no importa nada de afuera, `application` solo importa `domain` y sus propios puertos, y `adapters` implementan esos puertos. Express, Mongoose y bcrypt quedan siempre en `adapters`.

```
mayorista-backend/
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── .env.example
├── .gitignore
├── README.md
│
├── src/
│   ├── server.ts                    # Arranque: conecta la base y levanta Express
│   ├── app.ts                       # Crea la app Express y registra las rutas
│   ├── container.ts                 # Composition root: crea adaptadores e inyecta en casos de uso
│   │
│   ├── config/
│   │   ├── env.ts                   # Lee y valida variables de entorno
│   │   └── database.ts              # Conexión a MongoDB
│   │
│   ├── shared/                      # Código común, sin lógica de negocio
│   │   ├── errors/
│   │   │   ├── AppError.ts          # Clase base de errores de aplicación
│   │   │   ├── NotFoundError.ts     # 404
│   │   │   ├── ConflictError.ts     # 409
│   │   │   ├── ValidationError.ts   # 400
│   │   │   └── ForbiddenError.ts    # 403
│   │   ├── http/
│   │   │   ├── errorHandler.ts      # Traduce errores a respuestas HTTP
│   │   │   ├── validate.ts          # Middleware de validación de body/query
│   │   │   └── pagination.ts        # page, limit y formato de respuesta paginada
│   │   ├── types/
│   │   │   └── Result.ts
│   │   └── utils/
│   │       └── decimal.ts           # Conversión string/number ↔ Decimal128
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── domain/
│   │   │   │   ├── User.ts          # Entidad
│   │   │   │   └── Role.ts          # "customer" | "admin"
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── UserRepository.ts       # Interfaz (puerto de salida)
│   │   │   │   │   ├── PasswordHasher.ts       # Interfaz
│   │   │   │   │   └── TokenService.ts         # Interfaz
│   │   │   │   └── use-cases/
│   │   │   │       ├── RegisterUser.ts
│   │   │   │       ├── LoginUser.ts
│   │   │   │       └── GetCurrentUser.ts
│   │   │   └── adapters/
│   │   │       ├── in/http/
│   │   │       │   ├── auth.routes.ts
│   │   │       │   ├── auth.controller.ts
│   │   │       │   └── auth.schemas.ts         # Validación del body (Zod)
│   │   │       └── out/
│   │   │           ├── persistence/
│   │   │           │   ├── UserModel.ts        # Schema de Mongoose
│   │   │           │   └── MongoUserRepository.ts
│   │   │           └── security/
│   │   │               ├── BcryptPasswordHasher.ts
│   │   │               └── JwtTokenService.ts
│   │   │
│   │   ├── users/                   # Administración de usuarios (Admin)
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   │   ├── ports/           # Puede reutilizar UserRepository de auth
│   │   │   │   └── use-cases/
│   │   │   │       ├── ListUsers.ts
│   │   │   │       ├── GetUser.ts
│   │   │   │       ├── CreateUser.ts
│   │   │   │       ├── UpdateUser.ts
│   │   │   │       └── DeactivateUser.ts
│   │   │   └── adapters/in/http/
│   │   │       ├── users.routes.ts
│   │   │       ├── users.controller.ts
│   │   │       └── users.schemas.ts
│   │   │
│   │   ├── catalog/                 # Catálogos: marcas, categorías, envases, medidas, empaquetados
│   │   │   ├── brands/
│   │   │   │   ├── domain/Brand.ts
│   │   │   │   ├── application/
│   │   │   │   │   ├── ports/BrandRepository.ts
│   │   │   │   │   └── use-cases/      # ListBrands, GetBrand, CreateBrand, UpdateBrand, DeactivateBrand
│   │   │   │   └── adapters/
│   │   │   │       ├── in/http/        # brands.routes.ts, brands.controller.ts, brands.schemas.ts
│   │   │   │       └── out/persistence/# BrandModel.ts, MongoBrandRepository.ts
│   │   │   ├── categories/             # misma forma que brands; sin "active", se elimina de verdad
│   │   │   ├── container-types/        # misma forma que brands
│   │   │   ├── measurement-units/      # misma forma que brands; valida volumen + envase
│   │   │   └── packagings/             # misma forma que brands
│   │   │
│   │   ├── products/
│   │   │   ├── domain/
│   │   │   │   ├── Product.ts          # Raíz del agregado, con lista de Variant
│   │   │   │   ├── Variant.ts          # Entidad hija dentro del agregado Product (tiene _id propio)
│   │   │   │   └── errors.ts           # SkuDuplicado, CombinacionDuplicada
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── ProductRepository.ts
│   │   │   │   │   └── CatalogLookup.ts   # Verifica que marca, categorías, medidas y empaques existan
│   │   │   │   └── use-cases/
│   │   │   │       ├── ListProducts.ts
│   │   │   │       ├── GetProduct.ts
│   │   │   │       ├── CreateProduct.ts
│   │   │   │       ├── UpdateProduct.ts
│   │   │   │       ├── DeactivateProduct.ts
│   │   │   │       ├── AddVariant.ts
│   │   │   │       ├── UpdateVariant.ts
│   │   │   │       ├── DeactivateVariant.ts
│   │   │   │       └── GetProductFormData.ts
│   │   │   └── adapters/
│   │   │       ├── in/http/
│   │   │       │   ├── products.routes.ts
│   │   │       │   ├── products.controller.ts
│   │   │       │   ├── variants.controller.ts
│   │   │       │   └── products.schemas.ts
│   │   │       └── out/
│   │   │           ├── persistence/
│   │   │           │   ├── ProductModel.ts      # Variantes embebidas
│   │   │           │   ├── MongoProductRepository.ts
│   │   │           │   └── MongoCatalogLookup.ts
│   │   │
│   │   ├── stock/
│   │   │   ├── domain/
│   │   │   │   └── Stock.ts            # Unidades sueltas; calcula cajones + sueltas
│   │   │   ├── application/
│   │   │   │   ├── ports/StockRepository.ts
│   │   │   │   └── use-cases/
│   │   │   │       ├── GetStockByProduct.ts
│   │   │   │       ├── ListStock.ts
│   │   │   │       └── SetStock.ts     # Convierte cajones + sueltas a unidades
│   │   │   └── adapters/
│   │   │       ├── in/http/            # stock.routes.ts, stock.controller.ts, stock.schemas.ts
│   │   │       └── out/persistence/    # StockModel.ts, MongoStockRepository.ts
│   │   │
│   │   └── orders/
│   │       ├── domain/
│   │       │   ├── Order.ts            # Calcula el total y las unidades por producto
│   │       │   ├── OrderItem.ts        # Item estándar o mixto, con copia de sku, name y precios
│   │       │   ├── OrderStatus.ts      # "confirmed" | "cancelled" y la regla de cancelación
│   │       │   └── errors.ts           # StockInsuficiente, MixtoInvalido, PedidoYaCancelado
│   │       ├── application/
│   │       │   ├── ports/
│   │       │   │   ├── OrderRepository.ts
│   │       │   │   ├── ProductCatalog.ts    # Lee variantes y precios desde products
│   │       │   │   └── StockReserver.ts     # Descuenta el stock al crear el pedido y lo devuelve al cancelar
│   │       │   └── use-cases/
│   │       │       ├── ListOrders.ts
│   │       │       ├── ListMyOrders.ts
│   │       │       ├── GetOrder.ts
│   │       │       ├── PreviewOrder.ts      # Valida y cotiza el carrito; no crea nada ni toca el stock
│   │       │       ├── CreateOrder.ts       # Revalida, descuenta stock y crea el pedido (atómico)
│   │       │       └── CancelOrder.ts       # Dueño o admin; devuelve el stock (atómico)
│   │       └── adapters/
│   │           ├── in/http/            # orders.routes.ts, orders.controller.ts, orders.schemas.ts
│   │           └── out/
│   │               ├── persistence/    # OrderModel.ts, MongoOrderRepository.ts
│   │               └── integrations/   # MongoProductCatalog.ts, MongoStockReserver.ts
│   │
│   └── http/
│       ├── middlewares/
│       │   ├── authenticate.ts         # Valida JWT y carga req.user
│       │   └── authorize.ts            # authorize("admin") para rutas de Admin
│       └── routes.ts                   # Monta los routes de cada módulo bajo /api
│
├── tests/
│   ├── unit/                           # Casos de uso y dominio, con repositorios falsos
│   │   ├── auth/
│   │   ├── products/
│   │   ├── orders/
│   │   └── ...
│   ├── integration/                    # Repositorios Mongo contra una base de prueba
│   └── e2e/                            # Endpoints con supertest
│
└── docs/
    ├── api-endpoints.md
    ├── Database.md
    ├── Modelo_BD.md
    └── REGLAS_NEGOCIO.md
```

Notas de organización:

- **Puertos:** las interfaces viven en `application/ports`. Los casos de uso dependen de la interfaz y el `container.ts` les pasa la implementación de Mongo. Así podés probar sin base.
- **Modelos de Mongoose:** están solo en `adapters/out/persistence`. El dominio no conoce `ObjectId` ni `Decimal128`; los adaptadores hacen la conversión.
- **Variantes embebidas:** `Product` es la raíz del agregado y las variantes solo se modifican a través de él. Las reglas de SKU único dentro del producto y de combinación medida + empaque única viven en `domain`, porque ningún índice de Mongo las puede garantizar dentro de un array. Cada variante recibe su `_id` desde la aplicación.
- **Pedidos y stock:** crear un pedido (descontar stock) y cancelarlo (devolverlo) deben ser atómicos. El puerto que permita ejecutar ambas operaciones en una misma transacción se define al llegar a la etapa de pedidos.
- **Carrito:** vive en el frontend. El backend solo ofrece `PreviewOrder` para validarlo y cotizarlo.
- **Catálogos:** cada catálogo tiene la misma forma. Si preferís menos carpetas, podés agruparlos en un solo módulo con archivos por entidad, pero la separación mantiene cada uno independiente.
- **Validación:** los `schemas` (Zod, u otra librería) validan la entrada HTTP. Las reglas de negocio, como SKU único o la suma de un mixto, van en `domain` o `application`.
- **Tests:** los unitarios no necesitan base; por eso los puertos son importantes.
