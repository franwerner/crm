# EDR — Capas y reglas de dependencia

- **Status:** Accepted
- **Type:** policy
- **Date:** 2026-05-17
- **Applied pattern:** Repository — el port vive en `domain/` y el adapter en `infrastructure/`, lo que permite aislar el dominio de la persistencia y swap del adapter sin tocar dominio.

## Contexto

El EDR más importante del dominio: estas reglas se respetan en cada sesión y se pueden enforzar automáticamente. En Vertical Slice las "capas" son estructura interna del slice + un shared kernel chico, no carpetas globales por capa.

## Decisión

Cada slice se organiza en cuatro capas internas —`domain/`, `application/`, `infrastructure/`, `http/`— más un shared kernel que no conoce features. Carpeta de slice en plural, archivos en singular. Las carpetas vacías no se crean: un slice sin entidad nominal propia (solo lector de otro módulo) no tiene `domain/`, pero sí `infrastructure/` (ahí viven su composition-root local y sus adapters de lectura); `value-objects/` se crea recién con el primer VO.

El wiring de adapters concretos y la instanciación de use-cases/controllers es un **composition root distribuido**: cada slice tiene su mini composition-root local, y el composition root global orquesta la composición llamando a los de cada módulo y enrutándolos. El composition root global instancia las deps de borde (DB) y las pasa a cada bootstrap de slice.

## Alcance

- `src/modules/*/domain/**` — dominio puro del slice.
- `src/modules/*/domain/*.repository.ts` — PORT del repo (contrato dominio↔persistencia, hexagonal-pure).
- `src/modules/*/application/use-cases/**` — casos de uso sin framework.
- `src/modules/*/application/*.query.ts` — read-ports (CQRS-lite + lecturas cross-módulo).
- `src/modules/*/infrastructure/**` — adapters concretos (único punto que toca la DB).
- `src/modules/*/infrastructure/bootstrap.ts` — mini composition-root del slice.
- `src/modules/*/http/**` — capa de transporte (routes, controller, dto in/out).
- `src/shared/**` — shared kernel (no conoce features).
- `src/app.ts` — composition root global.

## Reglas verificables

- **[tool: dependency-cruiser]** (`adr02-1-domain-purity`) el dominio puro (`domain/` salvo el port) solo importa dentro de su propio `domain/` y de `shared/errors/**`; nunca el framework HTTP, DB ni otro slice.
- **[tool: dependency-cruiser]** (`adr02-1b-port-contract`) el port (`domain/*.repository.ts`) puede importar además `shared/types/**` (para `Page<T>`, `PageParams`); nunca `http/`, `infrastructure/` ni otro slice.
- **[tool: dependency-cruiser]** (`adr02-2-usecases-no-framework`) `application/use-cases/**` importa su propio `domain/` + `shared/**`; nunca el framework HTTP, `infrastructure/**` ni `http/**` de ningún slice.
- **[tool: dependency-cruiser]** (`adr02-2b-read-port`) `application/*.query.ts` importa su propio `domain/` + `shared/**`; nunca el framework HTTP, `infrastructure/` ni `http/`.
- **[tool: dependency-cruiser]** (`adr02-3-presentation-no-data`) ningún archivo bajo `http/` toca DB ni `infrastructure/` directamente.
- **[tool: dependency-cruiser]** (`adr02-4-db-only-in-adapter`) solo los adapters de `infrastructure/` (`*.repository.bun.ts`, `*.query.drizzle.ts`, `repositories/*.repo-part.ts`) importan `shared/db/**`.
- **[tool: dependency-cruiser]** (`adr02-5-slices-isolated`) `modules/A/**` no importa NADA de `modules/B/**`, sin excepción. Es el corazón del Vertical Slice y la regla que más se viola sin querer.
- **[tool: dependency-cruiser]** (`adr02-6-shared-no-modules`) `shared/**` no importa NADA de `modules/**`.
- **[tool: dependency-cruiser]** (`adr02-7-only-root-wires-adapters`) solo `infrastructure/bootstrap.ts` del propio slice y `app.ts` instancian `*.repository.bun.ts` / `*.query.drizzle.ts`; cada bootstrap cablea SOLO archivos de su propio slice.
- **[tool: dependency-cruiser]** (`no-circular`) sin dependencias circulares.
- **[tool: dependency-cruiser]** gate de CI obligatorio: el pipeline corre `depcruise src` y falla ante cualquier violación. Sin el gate, las reglas son un deseo, no una convención.
- **[manual]** blind spots conocidos del gate: dependency-cruiser detecta imports, no globals del runtime, ni el acoplamiento cross-módulo que viaja por el schema compartido (`@shared/db`). Ambos se mitigan solo con review.

## Colaboración cross-slice (lectura directa por read-port del consumidor)

Cuando un módulo necesita **datos** de otro, NO hay contrato publicado por el proveedor ni inyección cross-slice. El **consumidor** se hace cargo: define un read-port propio y un adapter que lee el schema compartido.

**Mecánica:**

- El consumidor define un read-port en su capa de aplicación: interface(s) con las operaciones de lectura que necesita + read models (DTOs planos) con SOLO las propiedades que va a usar. Tipos puros, sin imports de runtime de otro slice.
- La implementación vive en el `infrastructure/` del consumidor: hace el SELECT/JOIN sobre las tablas que necesita del schema compartido `@shared/db` (incluidas tablas "de" otro módulo) y mapea al read model. Sigue las reglas de DB de los adapters.
- El use-case del consumidor depende del read-port, no del repository de otro slice. Su composition root local instancia el adapter con la DB.

**Consecuencias y límites:**

1. **El proveedor no expone nada.** No hay patrón de API pública por módulo. Cada consumidor lee lo que necesita directo del schema compartido.
2. **El gate queda CIEGO al acoplamiento cross-módulo.** La regla de aislamiento sigue prohibiendo imports `modules/A → modules/B`, pero el acoplamiento real se mudó a la lectura del schema compartido, que el gate permite y NO inspecciona. El consumidor depende de la forma de las tablas de otro módulo sin contrato que lo proteja. **Riesgo asumido conscientemente**; se mitiga SOLO con review.
3. **Solo cubre LECTURAS.** No hay mecanismo para invocar OPERACIONES de otro módulo (validaciones, comandos). Si aparece esa necesidad, hay que **reabrir esta decisión** (no improvisar): el read-port no resuelve comportamiento cross-módulo.
4. **Datos sensibles cruzan sin filtro de contrato.** Un consumidor puede leer credenciales o campos sensibles de otro módulo directo del schema compartido. Es responsabilidad del consumidor no propagar en su read model más de lo que necesita.

Read models planos, NUNCA entidades de dominio de otro slice, cruzan el borde.

## Alternativas consideradas

- **Carpetas globales por capa** (`controllers/`, `services/`) — descartado: rompe la cohesión por feature de `architecture-style.md`.
- **Split plano en la raíz del slice** (sin wrapper `domain/`/`application/`/`infrastructure/`/`http/`) — fue la decisión original y se revirtió: al madurar el slice (varios use-cases + presentation + repo + dominio dividido) la raíz acumulaba demasiados archivos sueltos y degradaba la lectura. Las capas resuelven el ruido visual con costo de una indirección.
- **Patrón de API pública por módulo** (el proveedor publica un contrato de lectura) — fue una decisión intermedia y se revirtió: cada consumidor lee lo que necesita directo del schema compartido (ver "Colaboración cross-slice").

## Consecuencias

**Positivas:** reglas verificables automáticamente; slices independientes; capas claras dentro del slice; cohesión visual; estructura predecible al crear un slice nuevo.

**Negativas / trade-offs:** un nivel más de indirección al navegar; el enforcement requiere configurar dependency-cruiser; al vivir el port en `domain/` hace falta una sub-regla que le permita `shared/types` (sin ella el dominio puro no podría usar `Page<T>`).

## Relacionados

- `depende-de` → [../tech/dependency-cruiser.md](../tech/dependency-cruiser.md) — herramienta que enforcea estas reglas.
- `relacionado-con` → [architecture-style.md](architecture-style.md) — el estilo que estas reglas traducen a dependencias verificables.
- `relacionado-con` → [inter-layer-communication.md](inter-layer-communication.md) — contratos que viajan por estos bordes.
- `relacionado-con` → [folder-structure.md](folder-structure.md) — naming y organización interna de estas capas.
- `relacionado-con` → [../contracts/api-contract.md](../contracts/api-contract.md) — condiciona la forma de la capa de transporte.
