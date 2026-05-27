# Rúbrica de coherencia y completitud

Lista central de chequeos que aplica `architecture-validate`. Es **ratchet-able**: cuando aparece una contradicción nueva, se agrega acá y queda cubierta para siempre.

## Cómo la lee el validador

Cada chequeo tiene: **severidad** (CRITICAL / WARNING / SUGGESTION), una **condición** evaluada sobre los ADRs, y un **mensaje** (qué/por qué/sugerencia). El validador evalúa las condiciones contra `.claude/adr/` y reporta las que se cumplen.

---

## Chequeos genéricos

### Completitud

- **[WARNING]** Una fase relevante para el tipo de proyecto no tiene ADR (ni siquiera `Not Applicable`). Hueco silencioso. *(Requiere la lista de fases relevantes o el catálogo `concerns/INDEX.md`; si no están disponibles, marcar como "no verificable".)*

### Higiene de status

- **[WARNING]** ADR `Accepted` sin sección "Decisión" con contenido concreto.
- **[WARNING]** ADR `Pending` o `Deferred` sin razón ni trigger.
- **[CRITICAL]** ADR `Superseded` sin link "Reemplazado por", o el ADR linkeado no existe.
- **[WARNING]** ADR `Not Applicable` sin razón.

### Verificabilidad

- **[WARNING]** `layers-and-dependencies` `Accepted` con reglas en prosa vaga en vez de globs/paths verificables.
- **[SUGGESTION]** Lenguaje vago ("tratá de no", "en lo posible", "idealmente", "evitar cuando se pueda") en las reglas de un ADR `Accepted`.

---

## Contradicciones conocidas (combinaciones entre ADRs)

| # | Severidad | Condición | Mensaje |
|---|---|---|---|
| 1 | CRITICAL | `architecture-style` ∈ {Clean, Hexagonal} **y** `inter-layer-communication` permite que las entidades de dominio crucen los bordes | Clean/Hexagonal exige DTOs en los bordes; entidades crudas cruzando rompen el aislamiento del dominio. Definir mapeo a DTOs. |
| 2 | CRITICAL | `architecture-style` ∈ {Clean, Hexagonal} **y** `inter-layer-communication` = "no usamos interfaces" | La inversión de dependencias —núcleo de Clean/Hexagonal— requiere interfaces en los bordes I/O. Sin interfaces no hay desacople real. |
| 3 | CRITICAL | `authorization` `Accepted` **y** `auth` = `Not Applicable` | No se puede autorizar sin autenticar. Si hay modelo de permisos, tiene que haber identidad. |
| 4 | WARNING | `layers-and-dependencies` `Accepted` (hay capas) **y** `arch-enforcement` ∈ {`Not Applicable`, "sin enforcement"} | Reglas de capas sin enforcement automatizado se degradan en el primer sprint apurado. Considerar import-linter/dependency-cruiser/ArchUnit. |
| 5 | WARNING | `error-handling` = "Result/Either" **y** stack Python/JS/TS sin librería de Result en `tech/` | Result types sin librería en ese stack es incómodo de sostener. Confirmar la elección o registrar la librería (returns, neverthrow). |
| 6 | WARNING | `data-access` usa patrón Repository **y** `architecture-style` = "sin patrón formal" | Repository sin arquitectura en capas suele ser inconsistente u over-engineering. Revisar si hace falta. |
| 7 | WARNING | `auth` = `Not Applicable` **y** tipo de proyecto ∈ {api-rest, api-graphql, web-ssr, web-spa} | API/web marcando auth como N/A: confirmar que es realmente interno o sin usuarios. |
| 8 | WARNING | `testing-strategy` con TDD obligatorio o cobertura mínima **y** sin test framework en `tech/` | Se exige TDD/cobertura pero no hay framework de test registrado. Registrar el framework. |
| 9 | WARNING | `input-validation` "solo en el borde" **y** `inter-layer-communication` "validación solo en dominio" | La validación quedó con un hueco o duplicada. Definir cuál es la fuente de verdad (o defensa en profundidad explícita). |
| 10 | SUGGESTION | `metrics` / `tracing` / `health-checks` `Accepted` **y** `deployment-topology` = `Not Applicable` | Observabilidad definida sin saber dónde/cómo corre el sistema. Conviene definir la topología. |
| 11 | SUGGESTION | `caching` con cache distribuido **y** `scalability`/`deployment-topology` indica una sola instancia | Un cache distribuido aporta poco con una sola instancia; quizá alcanza in-memory. |

---

## Ratchet

Cuando encontrás una contradicción o un chequeo útil que no está acá:

- Genérico → agregalo como bullet en la sección "Chequeos genéricos".
- Combinación entre ADRs → agregá una fila en la tabla "Contradicciones conocidas".

Siempre con severidad y mensaje (qué/por qué/sugerencia). Así el validador la atrapa de ahí en más.
