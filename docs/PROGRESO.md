# Progreso del proyecto

Última actualización: 2026-10-29

## Estado actual

- **Fase:** 1 - Setup
- **Etapa:** Validación de variables de entorno (PR abierto, pendiente de merge)
- **Rama activa:** `feature/config-env-validation`
- **Próximo paso:** MongoDB en Docker (replica set de un nodo) y luego `src/config/database.ts`
- **Esperando aprobación para:** Merge del PR de validación de entorno

## Fases

| #   | Fase                                                          | Estado    | Notas                                                                            |
| --- | ------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| 1   | Setup del proyecto (pnpm, TS, Express, Mongo, estructura)     | En curso  | Repo, dependencias, validación de entorno (PR abierto). Falta Mongo y estructura |
| 2   | Auth: registro, login, JWT, roles                             | Pendiente |                                                                                  |
| 3   | Catálogos: marcas, categorías, envases, medidas, empaquetados | Pendiente |                                                                                  |
| 4   | Productos y variantes                                         | Pendiente |                                                                                  |
| 5   | Stock                                                         | Pendiente |                                                                                  |
| 6   | Pedidos: preview, crear, cancelar                             | Pendiente |                                                                                  |
| 7   | Frontend                                                      | Pendiente |                                                                                  |

Estados posibles: Pendiente · En curso · En revisión · Terminada · Bloqueada.

## Módulos

| Módulo   | Estado    | Tests unitarios | Tests integración |
| -------- | --------- | --------------- | ----------------- |
| auth     | Pendiente | -               | -                 |
| catalog  | Pendiente | -               | -                 |
| products | Pendiente | -               | -                 |
| stock    | Pendiente | -               | -                 |
| orders   | Pendiente | -               | -                 |

## Decisiones tomadas

| Fecha      | Decisión                                                 | Motivo                                                                    |
| ---------- | -------------------------------------------------------- | ------------------------------------------------------------------------- |
| 2026-10-29 | Stack: TypeScript, Express 5, pnpm, MongoDB con Mongoose | Definido en PERFIL_TECNICO.md                                             |
| 2026-10-29 | `dev` y `start` ejecutan el `.ts` directo con Node 24    | Evita un paso de compilación en esta etapa                                |
| 2026-10-29 | `tsconfig` con `noEmit: true`                            | Node ejecuta TypeScript; `tsc` solo verifica tipos                        |
| 2026-10-29 | `"type": "module"` (ESM)                                 | Imports con `import` / `export`                                           |
| 2026-10-29 | Carga de `.env` con `--env-file-if-exists` (Node 24)     | Sin dependencias extra. No falla si el archivo no existe (hosting)        |
| 2026-10-29 | Validación de entorno con Zod (`src/config/env.ts`)      | Tipos derivados del esquema; falla al arrancar con todos los errores      |
| 2026-10-29 | `PORT` con default 3000, convertido a número             | Desarrollo simple; el valor se cambia en `.env` si el puerto está ocupado |
| 2026-10-29 | `JWT_SECRET` mínimo 32 caracteres                        | Evita claves cortas que se pueden adivinar                                |
| 2026-10-29 | Commit inicial en `main` y setup en rama con PR          | Convención de `git-workflow.md`                                           |
| 2026-10-29 | Merge de PRs con squash                                  | Un commit por cambio en `main`                                            |
| 2026-10-29 | Stock guardado en unidades sueltas                       | Permite convertir a cajones sin perder precisión (REGLAS_NEGOCIO)         |

## Pendientes y deuda técnica

- [ ] Levantar MongoDB en Docker con replica set `rs0` (volumen persistente)
- [ ] Ejecutar `docs/Database.md` en `mongosh`
- [ ] Definir framework de tests (Vitest o Jest) antes del módulo auth
- [ ] Reemplazar la prueba de `src/server.ts` por el arranque real

## Preguntas de comprobación pendientes

- Sin preguntas pendientes en la etapa de validación de entorno.

## Historial de sesiones

### 2026-10-29

- Qué se hizo: repo con `.gitignore` y `docs/` en `main`; setup de pnpm, TypeScript y Express; `PROGRESO.md` actualizado; validación de entorno con Zod, verificada con `JWT_SECRET` faltante, puerto ocupado (`EADDRINUSE`) y `PORT` alternativo.
- Qué quedó pendiente: merge de los PRs de setup y validación de entorno, MongoDB en Docker, estructura de carpetas.
- Ramas y PRs: `main` (base), `feature/config-env-validation` (PR abierto, pendiente de merge).
