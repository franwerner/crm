# EDR — Estructura de carpetas y naming

- **Status:** Accepted
- **Type:** convention
- **Date:** 2026-05-17

## Contexto

La estructura de carpetas quedó definida en `layers-and-dependencies.md` (slices + shared kernel). Faltó cerrar las convenciones de nombres y, al madurar el slice, la organización interna por capas (la raíz plana acumulaba demasiados archivos sueltos).

## Decisión

### Convenciones generales

| Qué | Convención |
|---|---|
| Archivos | `kebab-case` |
| Tipos, clases, interfaces | `PascalCase` |
| Funciones, variables | `camelCase` |
| Constantes de módulo | `UPPER_SNAKE_CASE` |
| Carpeta de feature (slice) | **plural** |
| Archivos dentro del slice | **singular** según la entidad |
| Organización | por feature (Vertical Slice), NO por capa técnica global |

### Sufijos por rol

| Sufijo | Capa | Rol |
|---|---|---|
| `.routes.ts` | `http/` | OpenAPIHono + createRoute + wiring (presentation) |
| `.controller.ts` | `http/` | Class con un método handler por ruta (presentation) |
| `.in.ts` | `http/dto/in/` | Zod schema + `z.infer` del request/query |
| `.out.ts` | `http/dto/out/` | Zod schema + `z.infer` de la view (reusable por concepto) |
| `.use-case.ts` | `application/use-cases/` | Caso de uso con `Input` co-locado |
| `.repository.ts` | `domain/` | PORT del repo (hexagonal-pure) |
| `.repository.bun.ts` | `infrastructure/` | Adapter Drizzle |
| `.query.ts` | `application/` | Read-port: read models planos + interface de lectura (CQRS-lite + lecturas cross-módulo) |
| `.query.drizzle.ts` | `infrastructure/` | Adapter de lectura Drizzle (proyecciones de lista + lecturas de otro módulo) |
| `.repo-part.ts` | `infrastructure/repositories/` | Parte de un repositorio adapter sub-agrupado; el root la compone |

### Orden de nombre

- **Use-cases y DTOs de input:** `<sustantivo>-<acción>`. Agrupa alfabéticamente por entidad cuando hay muchos archivos.
- **DTOs de output:** `<sustantivo>-<concepto>`. Una view por concepto, reusable entre endpoints.
- **Routes/controller:** `<entity>.routes.ts` / `<entity>.controller.ts` (singular).
- **Edge case sin entidad-sustantivo (ej. un slice de sesión):** la acción nombra el archivo y la carpeta del slice desambigua.

### Estructura interna del slice (por capa)

| Carpeta | Rol |
|---|---|
| `domain/` | Lógica pura del dominio + port abstracto: raíz del agregado + `*Props`, `policies.ts`, `types/`, `value-objects/`, `entities/`, y el PORT del repo. |
| `application/` | Casos de uso del slice: `use-cases/<entity>-<acción>.use-case.ts` con `Input`/deps según `inter-layer-communication.md`. |
| `infrastructure/` | Adapters concretos: único punto que toca Drizzle/DB. |
| `http/` | Transporte HTTP (presentation): routes, controller, `dto/in/`, `dto/out/`. |

**Reglas duras:**
- **Carpetas vacías NO se crean.** Un slice sin entidad nominal no tiene `domain/`, pero sí `infrastructure/`. La carpeta `value-objects/` se crea recién con el primer VO.
- **NO barrel `index.ts`.** Imports directos al archivo.
- La raíz del agregado vive en `domain/<entity>.ts`, nunca dentro de `entities/` (que es solo entidades hijas no-raíz).

### Sub-agrupación dentro de una capa cuando un slice crece

**Trigger:** aplicar cuando un slice supera ~15 archivos en una sola capa, o un archivo raíz de capa supera ~400-500 líneas con sub-conceptos claramente separables (sub-agregados del mismo aggregate). NO se crea un sub-slice (rompería el límite del agregado): el agregado sigue siendo uno (un repo, un port, un router público).

**Convención:** dentro de la capa, agrupar por sub-contexto (sub-agregado):
- `application/use-cases/<subcontexto>/<entity>-<acción>.use-case.ts`
- `http/routes/<entity>-<subcontexto>.routes.ts` + `http/controllers/<entity>-<subcontexto>.controller.ts`
- `infrastructure/repositories/<entity>-<subcontexto>.repo-part.ts`
- `domain/` y `http/dto/` NO se sub-agrupan.

**Patrón root-orquestador (la cara pública NO cambia):** el router raíz mantiene su factory y delega en sub-routes; el controller raíz mantiene todos sus métodos públicos delegando en sub-controllers construidos desde las mismas use-cases; el repository adapter raíz compone repo-parts pasándoles la misma DB y delega. Cada repo-part abre su propia transacción (un comando = una tx = una mutación del agregado); NO se comparte tx entre partes. View-mappers usados por >1 sub-controller viven compartidos, nunca duplicados.

**Naming:** carpeta de sub-contexto en singular; archivos `<entity>-<subcontexto>` para routes/controllers/repo-parts.

### Path aliases (imports absolutos)

Configurados en `tsconfig.json` (el runtime los resuelve nativamente; depcruise los normaliza a paths físicos vía `tsConfig`):

| Alias | Apunta a | Uso |
|---|---|---|
| `@shared/*` | `src/shared/*` | Shared kernel. |
| `@modules/*` | `src/modules/*` | Módulos. |

**Regla de uso (única):** TODO import que resuelva dentro de `src/shared/*` o `src/modules/*` usa el alias correspondiente — incluso intra-slice. Imports a archivos vecinos NO bajo `shared/` ni `modules/` se dejan relativos. No se crean alias adicionales (dos alias bastan para single-package). No se usa `baseUrl` (deprecado en TS 7.0; `paths` con valores relativos al tsconfig no lo necesita).

## Alcance

- `src/modules/*/` — carpeta de slice en plural.
- `src/modules/*/{domain,application,infrastructure,http}/**` — capas internas del slice.
- `src/modules/*/http/dto/{in,out}/**` — DTOs zod del borde.
- `src/modules/*/infrastructure/repositories/*.repo-part.ts` — partes de repositorio sub-agrupado (DB-touchers legítimos).
- `src/shared/*` → alias `@shared/*`; `src/modules/*` → alias `@modules/*`.

## Reglas verificables

- **[manual]** naming: tipos/clases `PascalCase`, funciones/vars `camelCase`, archivos `kebab-case`, constantes `UPPER_SNAKE_CASE`; slice en plural, archivos en singular. Hoy solo se chequea en review (sin linter de nombres).
- **[manual]** sin barrel `index.ts`; imports directos al archivo. Todo import bajo `shared/`/`modules/` usa su alias.
- **[manual]** la raíz del agregado vive en `domain/<entity>.ts`, no dentro de `entities/`.
- **[tool: dependency-cruiser]** los adapters sub-agrupados `infrastructure/repositories/*.repo-part.ts` son DB-touchers legítimos (regla de DB-isolation ajustada para admitir la profundidad extra; solo `infrastructure/**` toca DB).

## Alternativas consideradas

- **Carpetas de feature en singular** — descartado: se prefiere plural por consistencia con colecciones.
- **Filenames en camelCase** — descartado: kebab-case es el estándar adoptado.
- **Split plano en la raíz del slice** (sin wrapper de capas) — fue la decisión original y se revirtió: al madurar el slice la raíz acumulaba demasiados archivos sueltos y degradaba la lectura.
- **Orden `<verbo>-<sustantivo>` para use-cases** — fue la decisión original y se revirtió: con el sufijo `.use-case.ts` y todos los use-cases agrupados, el orden `<sustantivo>-<acción>` agrupa alfabéticamente por entidad y el verbo al final lee mejor.
- **DTOs sin folder `dto/`, todo en un único archivo de schemas** — fue la decisión original y se revirtió: al crecer el slice el archivo monolítico mezclaba in/out. Split en `dto/in/` (por endpoint) + `dto/out/` (view reusable por concepto), cada archivo con su `Schema` + `z.infer`.
- **Sufijos redundantes folder+filename** — elegido conscientemente: el folder agrupa, el sufijo da grep-friendliness global.
- **Importar enums del dominio en los DTOs zod** — descartado por convención (ver `inter-layer-communication.md`).
- **Meter la raíz del agregado dentro de `entities/`** — descartado: borra la asimetría raíz/hija (la raíz es la única con repository y límite de consistencia).

## Consecuencias

**Positivas:** naming predecible; un archivo nuevo se nombra sin pensar; búsquedas consistentes; agrupación por entidad mejora descubribilidad cuando el slice crece; sufijos explícitos permiten grep global.

**Negativas / trade-offs:** nombres más largos por los sufijos; un nivel más de indirección por la estructura de capas; requiere disciplina (idealmente un linter de nombres a futuro).

## Relacionados

- `refina` → [layers-and-dependencies.md](layers-and-dependencies.md) — cierra el naming y la organización interna de las capas que ese EDR define.
- `relacionado-con` → [inter-layer-communication.md](inter-layer-communication.md) — contratos por capa que estos sufijos nombran.
