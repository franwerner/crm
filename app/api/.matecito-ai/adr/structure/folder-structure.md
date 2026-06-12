# ADR — Estructura de carpetas y naming

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-26 (eliminado el patrón de API pública por módulo: se quita `public/` de la estructura y los sufijos `.public.ts`/`.public.impl.ts`; la colaboración cross-slice de lectura usa read-ports `.query.ts`/`.query.drizzle.ts` — ver `layers-and-dependencies.md`/`inter-layer-communication.md`/`../delivery/dependency-injection.md`/`read-models-for-lists.md`)
- **Decisores:** ifran
- **Fase:** folder-structure

## Contexto

La estructura de carpetas quedó definida en `layers-and-dependencies.md` (slices + shared kernel). Faltó cerrar las convenciones de nombres y, al madurar el slice, también la organización interna por capas (la raíz plana acumulaba demasiados archivos sueltos).

## Decisión

### Convenciones generales

| Qué | Convención |
|---|---|
| Archivos | `kebab-case` (`contact-create.use-case.ts`, `contact.routes.ts`) |
| Tipos, clases, interfaces | `PascalCase` (`Contact`, `ContactsRepository`, `NotFoundError`) |
| Funciones, variables | `camelCase` (`createContact`, `dbClient`) |
| Constantes de módulo | `UPPER_SNAKE_CASE` |
| Carpeta de feature (slice) | **plural** (`contacts/`, `users/`, `auth/`) |
| Archivos dentro del slice | **singular** según la entidad (`contact.ts`, `contact.routes.ts`, `user.repository.ts`) |
| Organización | por feature (Vertical Slice, ver `architecture-style.md`/`layers-and-dependencies.md`), NO por capa técnica global |

### Sufijos por rol

| Sufijo | Capa | Rol |
|---|---|---|
| `.routes.ts` | `http/` | OpenAPIHono + createRoute + wiring (presentation) |
| `.controller.ts` | `http/` | Solo funciones handler (presentation) |
| `.in.ts` | `http/dto/in/` | Zod schema + `z.infer` del request/query |
| `.out.ts` | `http/dto/out/` | Zod schema + `z.infer` de la view (reusable por concepto) |
| `.use-case.ts` | `application/use-cases/` | Caso de uso con `XxxInput` + `XxxDeps` co-locados (`inter-layer-communication.md`) |
| `.repository.ts` | `domain/` | PORT del repo (hexagonal-pure, `inter-layer-communication.md` §3.3) |
| `.repository.bun.ts` | `infrastructure/` | Adapter Drizzle |
| `.query.ts` | `application/` | Read-port: read models planos + interface de lectura (CQRS-lite y lecturas cross-módulo, `read-models-for-lists.md` / `layers-and-dependencies.md`) |
| `.query.drizzle.ts` | `infrastructure/` | Adapter de lectura Drizzle (proyecciones de lista + lecturas de otro módulo del schema compartido) |

### Orden de nombre

- **Use-cases y DTOs de input:** `<sustantivo>-<acción>` (ej. `contact-create.use-case.ts`, `contact-register-event.in.ts`). Agrupa alfabéticamente por entidad cuando hay muchos archivos.
- **DTOs de output:** `<sustantivo>-<concepto>` (ej. `contact.out.ts`, `contact-list.out.ts`). Una view por concepto, reusable entre endpoints.
- **Routes/controller:** `<entity>.routes.ts` / `<entity>.controller.ts` (singular).
- **Edge case sin entidad-sustantivo (ej. `auth`):** la acción nombra el archivo y la carpeta del slice desambigua (`login.use-case.ts`, `login.in.ts`, `login.out.ts`).

### Estructura interna del slice (por capa)

| Carpeta | Rol | Reglas |
|---|---|---|
| `domain/` | Lógica pura del dominio + port abstracto | Contiene `<entity>.ts` (raíz del agregado + `*Props`), `policies.ts`, `types/`, `value-objects/`, `entities/`, y el PORT `<entity>.repository.ts`. `layers-and-dependencies.md` reglas #1 (puro) y #1b (port permite `shared/types`). |
| `application/` | Casos de uso del slice | Contiene `use-cases/<entity>-<acción>.use-case.ts`. `inter-layer-communication.md`: `XxxInput`/`XxxDeps` co-locados; firma `xxx(input, deps)`. `layers-and-dependencies.md` regla #2: sin Hono, sin infrastructure, sin http. |
| `infrastructure/` | Adapters concretos | Contiene `<entity>.repository.bun.ts`. Único punto que toca Drizzle/DB (`layers-and-dependencies.md` #4). |
| `http/` | Transporte HTTP (presentation) | Contiene `<entity>.routes.ts`, `<entity>.controller.ts`, `dto/in/<entity>-<acción>.in.ts`, `dto/out/<entity>-<concepto>.out.ts`. `layers-and-dependencies.md` #3: sin DB ni adapter directo. |

**Reglas duras**:
- **Carpetas vacías NO se crean.** Si un slice no tiene entidad nominal (`auth`, que solo lee datos de otro módulo), no existe `domain/` — pero sí `infrastructure/` (su `bootstrap.ts` + el read-port `.query.drizzle.ts`). La carpeta `value-objects/` se crea recién con el primer VO.
- **NO barrel `index.ts`**. Imports directos al archivo.
- La raíz del agregado vive en `domain/<entity>.ts`, nunca dentro de `entities/` (que es solo entidades hijas no-raíz).

### Path aliases (imports absolutos)

Configurados en `tsconfig.json` (Bun los resuelve nativamente; depcruise los normaliza a paths físicos vía `tsConfig`):

```json
"paths": {
  "@shared/*": ["./src/shared/*"],
  "@modules/*": ["./src/modules/*"]
}
```

| Alias | Apunta a | Uso |
|---|---|---|
| `@shared/*` | `src/shared/*` | Shared kernel: `@shared/errors`, `@shared/schemas/pagination.schema`, `@shared/db/client`, `@shared/types/pagination`. |
| `@modules/*` | `src/modules/*` | Módulos: `@modules/contacts/domain/contact`, `@modules/auth/application/auth-user.query`. |

**Regla de uso (única)**: TODO import que resuelva dentro de `src/shared/*` o `src/modules/*` usa el alias correspondiente — incluso intra-slice. Imports a archivos vecinos NO bajo `shared/` ni `modules/` (`server.ts ↔ app.ts`, etc.) se dejan relativos. No se crean alias adicionales (la granularidad de dos alias es suficiente para single-package).

**Por qué no `baseUrl`**: deprecado en TS 7.0. `paths` con valores relativos al tsconfig (`./src/...`) no lo necesita.

## Alternativas consideradas

- Carpetas de feature en singular — no elegido (se prefiere plural por consistencia con colecciones).
- Filenames en camelCase — no elegido (kebab-case es el estándar adoptado).
- **Split plano en la raíz del slice** (sin wrapper `domain/`/`application/`/etc.) — fue la decisión original (2026-05-17 hasta 2026-05-20). **Revertida el 2026-05-20**: al madurar el slice, la raíz acumulaba ~9 archivos sueltos + 3 carpetas, y degradaba la lectura. Las capas resuelven el ruido con costo de una indirección. Ver `layers-and-dependencies.md` "Alternativas" para el mismo contexto.
- **`<verbo-sustantivo>` (`create-contact.ts`) para use-cases** — fue la decisión original. **Revertida el 2026-05-20**: al sumar `.use-case.ts` y agrupar todos los use-cases en `application/use-cases/`, el orden `<sustantivo>-<acción>` agrupa alfabéticamente por entidad. El sufijo `.use-case.ts` ya transmite la naturaleza de acción; el verbo al final lee bien y agrupa mejor.
- **DTOs sin folder `dto/`, todo en un único `<feature>.schemas.ts`** — fue la decisión original. **Revertida el 2026-05-20**: al crecer el slice (8 endpoints con sus inputs y views), el archivo monolítico se volvió pesado y mezclaba in/out. Split en `dto/in/` (zod schema del request, archivo por endpoint) + `dto/out/` (zod schema de la view, archivo por concepto reusable). Cada archivo exporta su `Schema` + `z.infer<...>` en el MISMO archivo (`inter-layer-communication.md` §3.1 single source of truth dentro del archivo).
- Sufijos redundantes folder+filename (`.use-case.ts` en `use-cases/`, `.in.ts` en `dto/in/`, etc.) — elegido conscientemente: el folder agrupa, el sufijo da grep-friendliness global (`*.use-case.ts`, `*.in.ts`).
- Importar enums del dominio en los DTOs zod — descartado por convención (ver `inter-layer-communication.md` §3.1 "Closed types del dominio en los DTOs").
- Meter la raíz del agregado dentro de `entities/` — descartado: borra la asimetría raíz/hija (la raíz es el único con repository y límite de consistencia).

## Consecuencias

**Positivas:** naming predecible; un archivo nuevo se nombra sin pensar; búsquedas consistentes; agrupación por entidad mejora descubribilidad cuando el slice crece; sufijos explícitos permiten grep global (`*.use-case.ts`, `*.in.ts`, `*.out.ts`).

**Negativas / trade-offs:** archivos con nombres más largos por los sufijos; un nivel más de indirección por la estructura de capas; requiere disciplina (idealmente un linter de nombres a futuro).

## Reglas concretas

- Un slice nuevo: carpeta `src/modules/<feature-plural>/` con las sub-carpetas por capa que tengan contenido. Mínimo común: `domain/<entity>.ts` + `application/use-cases/<entity>-<acción>.use-case.ts`. Si expone HTTP: `http/<entity>.routes.ts` + `http/<entity>.controller.ts` + `http/dto/in/` + `http/dto/out/`. Si persiste: `domain/<entity>.repository.ts` (PORT) + `infrastructure/<entity>.repository.bun.ts`. Si colabora cross-slice (lee datos de otro módulo): `application/<x>.query.ts` (read-port) + `infrastructure/<x>.query.drizzle.ts` (adapter que lee el schema compartido).
- Carpetas vacías NO se crean.
- Tipos/clases `PascalCase`, funciones/vars `camelCase`, archivos `kebab-case`, constantes `UPPER_SNAKE_CASE`.
- Singular en archivos (`contact.ts`), plural en la carpeta del slice (`contacts/`).
- Orden `<sustantivo>-<acción>` en use-cases y DTOs in; `<sustantivo>-<concepto>` en DTOs out.
