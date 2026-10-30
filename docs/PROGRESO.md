# Progreso del proyecto

Última actualización: 2026-10-30

## Estado actual

- **Fase:** 1 - Setup
- **Etapa:** Conexión a MongoDB con manejo de errores (cerrada en el código, pendiente de commit y PR)
- **Rama activa:** `feature/database-connection`
- **Próximo paso:** Estructura de carpetas (`modules/`, `shared/`, `http/`) y luego el framework de tests
- **Esperando aprobación para:** Merge del PR de conexión a MongoDB

## Fases

| #   | Fase                                                          | Estado    | Notas                                                                                                             |
| --- | ------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | Setup del proyecto (pnpm, TS, Express, Mongo, estructura)     | En curso  | Repo, validación de entorno (mergeado), MongoDB en Docker y conexión (PR pendiente). Falta estructura de carpetas |
| 2   | Auth: registro, login, JWT, roles                             | Pendiente |                                                                                                                   |
| 3   | Catálogos: marcas, categorías, envases, medidas, empaquetados | Pendiente |                                                                                                                   |
| 4   | Productos y variantes                                         | Pendiente |                                                                                                                   |
| 5   | Stock                                                         | Pendiente |                                                                                                                   |
| 6   | Pedidos: preview, crear, cancelar                             | Pendiente |                                                                                                                   |
| 7   | Frontend                                                      | Pendiente |                                                                                                                   |

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

## Decisiones tomadas

| Fecha      | Decisión                                                            | Motivo                                                                                                                            |
| ---------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-29 | Stack: TypeScript, Express 5, pnpm, MongoDB con Mongoose            | Definido en PERFIL_TECNICO.md                                                                                                     |
| 2026-10-29 | `dev` y `start` ejecutan el `.ts` directo con Node 24               | Evita un paso de compilación en esta etapa                                                                                        |
| 2026-10-29 | `tsconfig` con `noEmit: true`                                       | Node ejecuta TypeScript; `tsc` solo verifica tipos                                                                                |
| 2026-10-29 | `"type": "module"` (ESM)                                            | Imports con `import` / `export`                                                                                                   |
| 2026-10-29 | Carga de `.env` con `--env-file-if-exists` (Node 24)                | Sin dependencias extra. No falla si el archivo no existe (hosting)                                                                |
| 2026-10-29 | Validación de entorno con Zod (`src/config/env.ts`)                 | Tipos derivados del esquema; falla al arrancar con todos los errores                                                              |
| 2026-10-29 | `PORT` con default 3000, convertido a número                        | Desarrollo simple; el valor se cambia en `.env` si el puerto está ocupado                                                         |
| 2026-10-29 | `JWT_SECRET` mínimo 32 caracteres                                   | Evita claves cortas que se pueden adivinar                                                                                        |
| 2026-10-29 | Commit inicial en `main` y setup en rama con PR                     | Convención de `git-workflow.md`                                                                                                   |
| 2026-10-29 | Merge de PRs con squash                                             | Un commit por cambio en `main`                                                                                                    |
| 2026-10-29 | Stock guardado en unidades sueltas                                  | Permite convertir a cajones sin perder precisión (REGLAS_NEGOCIO)                                                                 |
| 2026-10-30 | MongoDB en Docker como replica set de un nodo                       | Las transacciones de pedidos (descontar stock y crear pedido) requieren replica set                                               |
| 2026-10-30 | Puerto del contenedor en el host: `27018`                           | El `mongod` del sistema ocupa el `27017`                                                                                          |
| 2026-10-30 | Conexión con `directConnection=true`                                | El host registrado en el replica set (`localhost:27017`) no es alcanzable desde el host; `rs.reconfig` fue rechazado              |
| 2026-10-30 | `connectDatabase()` relanza el error; `server.ts` sale con código 1 | Si la base no conecta, el servidor no debe arrancar. `connectDatabase` registra el error y `server.ts` decide el código de salida |

## Pendientes y deuda técnica

- [ ] Commitear y abrir PR de `feature/database-connection` (`server.ts`, `database.ts`, `.env.example`, `package.json`, `pnpm-lock.yaml`)
- [ ] Confirmar que `docker-compose.yml` está commiteado (rama `chore/mongo-docker`) o incluirlo en el PR anterior
- [ ] Definir framework de tests (Vitest o Jest) antes del módulo auth
- [ ] Seguridad: el MongoDB del proyecto no tiene autenticación (warning de arranque). Anotado para después del MVP local, antes de cualquier despliegue
- [ ] Archivo `.env.example` con `MONGODB_URI` y sin valores reales (verificar)

## Preguntas de comprobación pendientes

- Pregunta 1 de conexión: explicar por qué el `await` lanza la excepción en la misma línea (respondida, pendiente de validar).
- Pregunta de replica set: qué pasaría con los datos si se borra el volumen con `docker compose down -v` y qué habría que volver a correr (sin respuesta todavía).
- Pregunta de `directConnection`: qué host intentaría usar el driver sin ese parámetro (sin respuesta todavía).

## Historial de sesiones

### 2026-10-29

- Qué se hizo: repo con `.gitignore` y `docs/` en `main`; setup de pnpm, TypeScript y Express; `PROGRESO.md` actualizado; validación de entorno con Zod, verificada con `JWT_SECRET` faltante, puerto ocupado (`EADDRINUSE`) y `PORT` alternativo.
- Ramas y PRs: `main` (base), `feature/config-env-validation` (mergeado).

### 2026-10-30

- Qué se hizo: MongoDB levantado en Docker como replica set `rs0`. Resueltos el conflicto de puerto 27017 (con el `mongod` del sistema) y el host del replica set. Cargadas las colecciones e índices de `docs/Database.md`. Instalado Mongoose y creado `src/config/database.ts` con `connectDatabase` y `disconnectDatabase`. Probado el camino feliz (conexión OK) y el de error (puerto incorrecto: el servidor no arranca). `server.ts` quedó con `process.exit(1)` si la base no conecta.
- Qué quedó pendiente: commit y PR de la conexión, y la estructura de carpetas.
- Ramas y PRs: `main` (base), `feature/database-connection` (PR pendiente).
