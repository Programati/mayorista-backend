# Progreso del proyecto

Última actualización: 2026-10-31

## Estado actual

- **Fase:** 1 - Setup
- **Etapa:** Framework de tests instalado (Vitest). Setup cerrado salvo verificación de salida con base apagada.
- **Rama activa:** `main`
- **Próximo paso:** Módulo auth, empezando por la entidad `User` y su rol en `domain` (sin caso de uso todavía)
- **Esperando aprobación para:** Empezar el módulo auth

## Fases

| #   | Fase                                                          | Estado    | Notas                                                                                                                                          |
| --- | ------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Setup del proyecto (pnpm, TS, Express, Mongo, estructura)     | En curso  | Conexión a Mongo, app separada de server y Vitest instalado. Falta verificar `echo $?` con base apagada y la estructura de carpetas de módulos |
| 2   | Auth: registro, login, JWT, roles                             | Pendiente | Arranca por la entidad `User` y el rol en `domain`                                                                                             |
| 3   | Catálogos: marcas, categorías, envases, medidas, empaquetados | Pendiente |                                                                                                                                                |
| 4   | Productos y variantes                                         | Pendiente |                                                                                                                                                |
| 5   | Stock                                                         | Pendiente |                                                                                                                                                |
| 6   | Pedidos: preview, crear, cancelar                             | Pendiente |                                                                                                                                                |
| 7   | Frontend                                                      | Pendiente | Vitest se amplía con `jsdom` o `happy-dom` y `@testing-library/react` al llegar acá                                                            |

Estados posibles: Pendiente · En curso · En revisión · Terminada · Bloqueada.

## Módulos

| Módulo   | Estado    | Tests unitarios | Tests integración |
| -------- | --------- | --------------- | ----------------- |
| auth     | Pendiente | -               | -                 |
| catalog  | Pendiente | -               | -                 |
| products | Pendiente | -               | -                 |
| stock    | Pendiente | -               | -                 |
| orders   | Pendiente | -               | -                 |

## Infraestructura local

| Elemento          | Valor                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| Contenedor        | `mongo-mayorista` (imagen `mongo:7`), definido en `docker-compose.yml`                            |
| Puerto en el host | `27018` (el `27017` lo usa un `mongod` del sistema)                                               |
| Replica set       | `rs0`, con un único nodo. Host registrado: `localhost:27017` (visto desde dentro del contenedor)  |
| Base de datos     | `beverage_distributor`, con 9 colecciones e índices de `docs/Database.md` cargados                |
| Variable          | `MONGODB_URI=mongodb://localhost:27018/beverage_distributor?replicaSet=rs0&directConnection=true` |
| Tests             | Vitest, comando `pnpm test`. Configuración en `vitest.config.ts`, tests en `tests/`               |

## Decisiones tomadas

| Fecha      | Decisión                                                                                                                | Motivo                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-29 | Stack: TypeScript, Express 5, pnpm, MongoDB con Mongoose                                                                | Definido en PERFIL_TECNICO.md                                                                                                       |
| 2026-10-29 | `dev` y `start` ejecutan el `.ts` directo con Node 24                                                                   | Evita un paso de compilación en esta etapa                                                                                          |
| 2026-10-29 | `tsconfig` con `noEmit: true`                                                                                           | Node ejecuta TypeScript; `tsc` solo verifica tipos                                                                                  |
| 2026-10-29 | `"type": "module"` (ESM)                                                                                                | Imports con `import` / `export`                                                                                                     |
| 2026-10-29 | Carga de `.env` con `--env-file-if-exists` (Node 24)                                                                    | Sin dependencias extra. No falla si el archivo no existe (hosting)                                                                  |
| 2026-10-29 | Validación de entorno con Zod (`src/config/env.ts`)                                                                     | Tipos derivados del esquema; falla al arrancar con todos los errores                                                                |
| 2026-10-29 | `PORT` con default 3000, convertido a número                                                                            | Desarrollo simple; el valor se cambia en `.env` si el puerto está ocupado                                                           |
| 2026-10-29 | `JWT_SECRET` mínimo 32 caracteres                                                                                       | Evita claves cortas que se pueden adivinar                                                                                          |
| 2026-10-29 | Commit inicial en `main` y setup en rama con PR                                                                         | Convención de `git-workflow.md`                                                                                                     |
| 2026-10-29 | Merge de PRs con squash                                                                                                 | Un commit por cambio en `main`                                                                                                      |
| 2026-10-29 | Stock guardado en unidades sueltas                                                                                      | Permite convertir a cajones sin perder precisión (REGLAS_NEGOCIO)                                                                   |
| 2026-10-30 | MongoDB en Docker como replica set de un nodo                                                                           | Las transacciones de pedidos (descontar stock y crear pedido) requieren replica set                                                 |
| 2026-10-30 | Puerto del contenedor en el host: `27018`                                                                               | El `mongod` del sistema ocupa el `27017`                                                                                            |
| 2026-10-30 | Conexión con `directConnection=true`                                                                                    | El host registrado en el replica set (`localhost:27017`) no es alcanzable desde el host; `rs.reconfig` fue rechazado                |
| 2026-10-30 | `connectDatabase()` relanza el error; `server.ts` sale con código 1                                                     | Si la base no conecta, el servidor no debe arrancar. `connectDatabase` registra el error y `server.ts` decide el código de salida   |
| 2026-10-31 | Framework de tests: Vitest, no Jest                                                                                     | Proyecto en ESM + TypeScript; Vitest lo soporta sin `ts-jest` ni configuración extra. API casi igual a Jest                         |
| 2026-10-31 | Vitest no chequea tipos; se mantiene `pnpm run typecheck` aparte                                                        | Los tests verifican comportamiento; el typecheck verifica la forma del código en todo el proyecto. Ambos deben pasar antes de un PR |
| 2026-10-31 | Los puertos viven en `application/ports` y el caso de uso no importa modelos de Mongoose                                | Permite probar la lógica con repositorios en memoria, sin base ni colgarse por buffering de Mongoose                                |
| 2026-10-31 | Validación de email único: caso de uso (`findByEmail` → `ConflictError`) más índice único en Mongo como segunda barrera | El caso de uso da el error claro; el índice protege ante registros simultáneos. El adaptador traduce `E11000` a `ConflictError`     |

## Pendientes y deuda técnica

- [ ] Verificar `echo $?` = 1 con la base apagada (usando `node` sin `--watch`)
- [ ] Definir la estructura de carpetas de los módulos (`domain`, `application`, `adapters`) antes de empezar auth
- [ ] Seguridad: el MongoDB del proyecto no tiene autenticación. Anotado para antes de cualquier despliegue
- [ ] Al crear el adaptador de persistencia de auth, traducir `E11000` a `ConflictError`
- [ ] Decidir si `tests/unit/setup.test.ts` se borra cuando existan tests reales de auth

## Preguntas de comprobación pendientes

- Por qué `echo $?` debe ser `1` aunque el mensaje sea el mismo (sin respuesta todavía).
- Por qué el caso de uso no debe importar `UserModel` (respondida: rompe la regla de dependencias, obliga al test a depender de Mongoose y acopla la lógica a la persistencia).
- Qué debe devolver o lanzar el caso de uso si el email ya existe, y en qué capa vive la regla (respondida parcialmente: caso de uso con `ConflictError` y puerto; índice único como segunda barrera).

## Historial de sesiones

### 2026-10-29

- Qué se hizo: repo con `.gitignore` y `docs/` en `main`; setup de pnpm, TypeScript y Express; `PROGRESO.md` actualizado; validación de entorno con Zod, verificada con `JWT_SECRET` faltante, puerto ocupado (`EADDRINUSE`) y `PORT` alternativo.
- Ramas y PRs: `main` (base), `feature/config-env-validation` (mergeado).

### 2026-10-30

- Qué se hizo: MongoDB levantado en Docker como replica set `rs0`. Resueltos el conflicto de puerto 27017 (con el `mongod` del sistema) y el host del replica set. Cargadas las colecciones e índices de `docs/Database.md`. Instalado Mongoose y creado `src/config/database.ts` con `connectDatabase` y `disconnectDatabase`. Probado el camino feliz (conexión OK) y el de error (puerto incorrecto: el servidor no arranca). `server.ts` quedó con `process.exit(1)` si la base no conecta.
- Qué se hizo (refactor): `src/app.ts` con `createApp()` (Express y `express.json()`, sin base ni `listen`). `src/server.ts` conecta la base, crea la app y abre el puerto. Verificado: arranque con base, arranque sin base.
- Ramas y PRs: `main` (base), `feature/database-connection` (mergeado), `refactor/app-server-split` (mergeado).

### 2026-10-31

- Qué se hizo: elección de Vitest como framework de tests tras comparar con Jest. Instalado con `vitest.config.ts`, script `test` y un test de verificación (`tests/unit/setup.test.ts`) que pasa en verde. Repasados tests unitarios vs. de integración, el rol de `createApp()` en la velocidad de los tests y la validación de email único en el caso de uso.
- Ramas y PRs: `main` (base), `chore/test-framework` (mergeado).
- Auto-baja de un admin sobre sí mismo devuelve 403 (ForbiddenError), no 409 | 409 es para estado del recurso; esto es una prohibición sobre la propia cuenta
