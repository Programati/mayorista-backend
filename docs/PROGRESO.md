# Progreso del proyecto

Última actualización: 2026-10-29

## Estado actual

- **Fase:** 1 - Setup
- **Etapa:** Estructura de carpetas (siguiente: `config/env.ts`)
- **Rama activa:** `chore/project-setup` (PR pendiente de merge a `main`)
- **Próximo paso:** Crear `src/config/env.ts` que valide `PORT`, `MONGODB_URI` y `JWT_SECRET`
- **Esperando aprobación para:** Merge del PR de setup y arranque de la estructura de carpetas

## Fases

| #   | Fase                                                          | Estado    | Notas                                                      |
| --- | ------------------------------------------------------------- | --------- | ---------------------------------------------------------- |
| 1   | Setup del proyecto (pnpm, TS, Express, Mongo, estructura)     | Terminada | Repo, dependencias y arranque OK. Falta Mongo y estructura |
| 2   | Auth: registro, login, JWT, roles                             | Pendiente |                                                            |
| 3   | Catálogos: marcas, categorías, envases, medidas, empaquetados | Pendiente |                                                            |
| 4   | Productos y variantes                                         | Pendiente |                                                            |
| 5   | Stock                                                         | Pendiente |                                                            |
| 6   | Pedidos: preview, crear, cancelar                             | Pendiente |                                                            |
| 7   | Frontend                                                      | Pendiente |                                                            |

Estados posibles: Pendiente · En curso · Terminada · Bloqueada.

## Módulos

| Módulo   | Estado    | Tests unitarios | Tests integración |
| -------- | --------- | --------------- | ----------------- |
| auth     | Pendiente | -               | -                 |
| catalog  | Pendiente | -               | -                 |
| products | Pendiente | -               | -                 |
| stock    | Pendiente | -               | -                 |
| orders   | Pendiente | -               | -                 |

## Decisiones tomadas

| Fecha      | Decisión                                                  | Motivo                                                            |
| ---------- | --------------------------------------------------------- | ----------------------------------------------------------------- |
| 2026-10-29 | Stack: TypeScript, Express 5, pnpm, MongoDB con Mongoose  | Definido en PERFIL_TECNICO.md                                     |
| 2026-10-29 | `dev` y `start` ejecutan el `.ts` directo con Node 24     | Evita un paso de compilación en esta etapa                        |
| 2026-10-29 | `tsconfig` con `noEmit: true`                             | Node ejecuta TypeScript; `tsc` solo verifica tipos                |
| 2026-10-29 | `"type": "module"` (ESM)                                  | Imports con `import` / `export`                                   |
| 2026-10-29 | Commit inicial en `main` y setup en `chore/project-setup` | Convención de `git-workflow.md`                                   |
| 2026-10-29 | Merge de PRs con squash                                   | Un commit por cambio en `main`                                    |
| 2026-10-29 | Stock guardado en unidades sueltas                        | Permite convertir a cajones sin perder precisión (REGLAS_NEGOCIO) |

## Pendientes y deuda técnica

- [ ] Ejecutar `docs/Database.md` en `mongosh` (requiere replica set local)
- [ ] Definir framework de tests (Vitest o Jest) antes del módulo auth
- [ ] Reemplazar la prueba de `src/server.ts` por el arranque real

## Preguntas de comprobación pendientes

- Sin preguntas pendientes en la etapa de setup.

## Historial de sesiones

### 2026-10-29

- Qué se hizo: repo con `.gitignore` y `docs/` en `main`; setup de pnpm, TypeScript y Express en `chore/project-setup`; verificado `typecheck` y `dev` respondiendo en `localhost:3000`.
- Qué quedó pendiente: merge del PR de setup, Database.md en Mongo y estructura de carpetas.
- Ramas y PRs: `main`, `chore/project-setup` (PR mergeado).
