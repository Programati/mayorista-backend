# Convenciones de Git

Vigentes desde 2026-10-23. Ubicación en el repo: `docs/git-workflow.md`.

## 1. Rama principal

- `main` debe estar siempre estable: `pnpm run typecheck` en verde y, cuando existan, los tests en verde.
- No se commitea directamente en `main`. Única excepción: el commit inicial del repositorio.
- Todo cambio entra por Pull Request desde una rama de trabajo, incluso trabajando en solitario (deja historial y practica el flujo de equipo).

## 2. Nombres de ramas

Formato: `<tipo>/<descripcion-corta>`

| Tipo | Cuándo se usa | Ejemplo |
|---|---|---|
| `feature/` | Nueva funcionalidad | `feature/products-create-endpoint` |
| `fix/` | Corrección de un error | `fix/orders-cancel-twice-409` |
| `refactor/` | Reorganizar código sin cambiar su comportamiento | `refactor/stock-units-conversion` |
| `docs/` | Documentación | `docs/api-contract-v1` |
| `test/` | Agregar o mejorar pruebas de código ya existente | `test/orders-mixed-validation` |
| `chore/` | Configuración, dependencias, herramientas, mantenimiento | `chore/project-setup` |

Reglas:
- Minúsculas, palabras separadas por guiones (kebab-case), en inglés (coherente con el código).
- Nombre descriptivo y corto: debe decir qué se hace, no cuándo ni quién.
- Una rama = un propósito, de vida corta. Si hace falta otro propósito, otra rama.
- Los tests de código **nuevo** viajan en la misma rama que ese código. Una rama `test/` es para pruebas sobre código que ya existe.

## 3. Mensajes de commit

Formato: `<tipo>(<alcance opcional>): <resumen en imperativo>`

Correspondencia entre rama y tipo de commit:

| Rama | Tipo de commit |
|---|---|
| `feature/` | `feat` |
| `fix/` | `fix` |
| `refactor/` | `refactor` |
| `docs/` | `docs` |
| `test/` | `test` |
| `chore/` | `chore` |

Alcances válidos (corresponden a los módulos de `src/modules/`): `auth`, `users`, `catalog`, `products`, `stock`, `orders`. Para código transversal: `http`, `config`, `shared`.

Reglas:
- Resumen en imperativo, hasta 72 caracteres, sin punto final.
- Un commit = un cambio lógico. Si el resumen necesita "y", probablemente son dos commits.
- Si el motivo no es obvio, explicarlo en el cuerpo del commit (el "porqué", no el "qué").

Ejemplos:
```
chore: initialize project with pnpm and typescript
feat(products): add POST /api/products endpoint
fix(orders): return 409 when cancelling an already cancelled order
refactor(stock): move boxes-to-units conversion into domain
test(orders): cover mixed item with sum mismatch
docs: add REST contract for orders v1
```

## 4. Integración a `main`

- Antes de abrir el PR: `pnpm run typecheck` (y los tests, cuando existan) en verde.
- Descripción del PR: qué cambia, por qué, y cómo se verificó.
- Método de merge por defecto: **squash**. El título del PR sigue el formato de commit, y `main` queda con un commit por cambio.
- Borrar la rama una vez integrada.
- No reescribir (rebase/force push) historial ya publicado en `main`.

## 5. Qué se versiona y qué no

Archivo `.gitignore` mínimo:
```
node_modules/
dist/
.env
*.log
coverage/
```

- Sí se versiona `pnpm-lock.yaml`.
- Nunca se versionan secretos ni credenciales. Si hace falta documentar variables de entorno, se usa `.env.example` sin valores reales.

## 6. Primer arranque del repositorio

1. `git init`, con `.gitignore` creado antes del primer commit.
2. Commit inicial en `main` (por ejemplo, `.gitignore` y `docs/`).
3. El trabajo de setup ya hecho pasa por una rama `chore/project-setup` y su PR.
