# EDR — Comunicación entre capas

- **Status:** Accepted
- **Type:** convention
- **Date:** 2026-05-17
- **Applied pattern:** DTO — contratos de transferencia nombrados en cada borde (request/response, input del use-case) que desacoplan la presentación del dominio.

## Contexto

Define cómo viajan los datos entre handler, use-case y repo dentro y entre slices, y los contratos nombrados que separan cada borde. Contiene además una sub-decisión de comunicación cross-slice todavía **Pending** (§3.2).

## Decisión

### 3.1 — Contratos inter-capa con DTOs

Tres contratos nombrados, cada uno con su forma TS concreta y dónde vive.

**Borde HTTP (request / response): schema DTO zod.**
- Una sola fuente de verdad: el mismo schema valida el input crudo, es el contrato OpenAPI, y emite el tipo TS.
- El tipo TS se exporta con `z.infer` desde el MISMO archivo del schema.

**Input del use-case: `interface` TS puro, co-locado.**
- Vive en el archivo del use-case. Es un `interface` plano: SIN zod, SIN el framework HTTP, SIN imports de DTOs HTTP.
- Mantiene al use-case libre de presentación (preserva la regla de aislamiento del use-case).

**Dependencias del use-case: en el constructor de la class.**
- El use-case es una class que recibe sus dependencias por constructor (típicamente el repo; abierto a `clock`, `idGenerator`, `logger`, etc.) con visibilidad `private readonly`. No hay interface de deps separada. Esto centraliza el wiring en un único punto (la instanciación, hecha por el composition-root del slice).

**Firma estándar del use-case:** una class con `constructor(...deps)` y un método `async execute(input): Promise<...>`. Input es el contrato semántico (parámetro de `execute`); las deps son los servicios (parámetros del constructor). Separados a propósito. Una sola operación por class.

**Salida del use-case: la entidad de dominio.**
- El use-case devuelve la entidad o una colección (`Page<Entidad>`).
- El controller mapea entidad → response schema DTO leyendo getters. La entidad NO cruza el borde HTTP: solo el response DTO se serializa.

**Flujo del controller (presentación):** validar el request con el schema zod → construir el input mapeando del request DTO (incluye derivar identidad/autoría desde la sesión) → invocar el use-case (recibido ya construido por constructor) → mapear la entidad devuelta al response DTO y devolverla.

> La asimetría input-interface vs output-entidad es deliberada. El input DTO neutraliza un acoplamiento real (sin él, el use-case dependería de zod/presentación). En la salida ese riesgo no existe: la entidad sale de la aplicación y la presentación la consume legítimamente (dirección presentación → aplicación → dominio, no al revés).

**Closed types del dominio en los DTOs zod.** Los DTOs zod del borde HTTP NO importan los closed types del dominio: cada DTO redeclara su `z.enum([...])` con los valores válidos. Razón: el DTO es contrato del **WIRE**, independiente del dominio interno. Que dominio y wire evolucionen separados es una FEATURE de aislamiento — agregar un valor de dominio no debe filtrarse automáticamente al OpenAPI/clients, ni renombrar internamente debe romper backwards-compat de la API. La "drift bomb" se mitiga con disciplina en review, no con acoplamiento.

**Borde de MÓDULO (cross-slice).** La misma filosofía DTO-no-entidad aplica entre slices, pero la colaboración es **lectura directa del consumidor**, no un contrato publicado por el proveedor. El consumidor define un read-port propio con read models planos (solo los campos que usa) y un adapter que los lee del schema compartido. Cruzan read models, NUNCA la entidad de dominio de otro slice. Mecánica y límites completos en `layers-and-dependencies.md` → "Colaboración cross-slice".

### 3.2 — Comunicación / side-effects  *(Accepted + sub-Pending)*

**Accepted:** comunicación síncrona directa; la coordinación cross-slice se orquesta en el composition root (coherente con la regla de aislamiento de slices).

**Sub-decisión Pending — eventos de dominio in-process.** Ver `## Razón de omisión / aplazamiento`.

### 3.3 — Dónde vive el port del repo

**En `domain/` (hexagonal-pure).** El port ES el contrato del dominio con la persistencia: declara la interface abstracta que el dominio necesita, no su implementación. El dominio sigue sin conocer persistencia porque NO hay implementación en `domain/` — solo la interface. El adapter vive en `infrastructure/` e implementa el port. El use-case importa el port desde `domain/`.

> Esto FLIPEA la decisión original ("nivel application del slice"). Motivo: al reorganizar el slice a carpetas por capa, poner el port en `application/` separaba el contrato del dominio que lo declara. La interpretación hexagonal-pure (port = parte del dominio) es más coherente con la estructura por capa. Trade-off: el port puede importar `shared/types` (para `Page<T>`), lo que requirió una sub-regla en `layers-and-dependencies.md`.

### 3.4 — Validación

**En ambos (defensa en profundidad).**
- **Borde:** `zod` valida forma y tipos del input crudo (¿es string?, ¿vino el campo?).
- **Dominio:** invariantes de negocio en constructores / value objects (formato, montos no negativos, etc.). Una entidad inválida debe ser imposible de construir.
- No mezclar responsabilidades: las reglas de negocio NO van en el schema zod.

## Razón de omisión / aplazamiento

**Status:** Pending (sub-decisión §3.2 — eventos de dominio in-process)

No se adopta un mecanismo de eventos de dominio in-process todavía. **Trigger:** cuando la orquestación cross-slice en el composition root se vuelva un nudo (varios side-effects colgando de una operación). No se cierra la puerta con un "nunca"; se reevalúa cuando aparezca la necesidad real.

## Alcance

- `src/modules/*/http/dto/in/**`, `src/modules/*/http/dto/out/**` — schemas zod del borde HTTP (`z.infer` co-locado).
- `src/modules/*/application/use-cases/**` — `Input` co-locado + class use-case (`execute`).
- `src/modules/*/domain/*.repository.ts` — port del repo (hexagonal-pure).

## Reglas verificables

- **[tool: dependency-cruiser]** (`adr02-2-usecases-no-framework`) PROHIBIDO importar `zod`, el framework HTTP o DTOs HTTP desde un use-case.
- **[tool: dependency-cruiser]** (`adr02-5-slices-isolated`) nunca import directo entre `modules/A` y `modules/B`; si A necesita datos de B, define un read-port propio que lee `@shared/db`.
- **[manual]** los DTOs zod del borde redeclaran sus closed types (no importan `domain/types/`), aunque el gate técnicamente permita `http → domain`.
- **[manual]** la entidad de dominio no se serializa directo al borde HTTP; el controller mapea a un response DTO.
- **[manual]** defensa en profundidad: zod en el borde + invariantes en el dominio; las reglas de negocio no van en el schema zod.
- **[manual]** una sola operación por use-case (un solo `execute`); el input no incluye deps y las deps no incluyen datos del input.

## Alternativas consideradas

- **"Entidades pueden cruzar el borde HTTP"** — descartado: ataría el contrato de API al modelo interno.
- **"Tipo TS a mano + zod aparte"** — descartado: duplica forma y abre drift; `z.infer` da una sola fuente.
- **"Use-case input como `z.infer` del schema zod"** — descartado: viola el aislamiento del use-case y rompe su reusabilidad fuera de HTTP.
- **"Output DTO simétrico en el use-case"** — descartado HOY por YAGNI mientras HTTP sea el único consumidor. **Trigger para reevaluar:** múltiples consumidores del use-case (worker, CLI, otro bounded context) o necesidad de que la aplicación sea un contrato duro independiente de refactors del dominio.
- **"Sin eventos nunca"** (§3.2) — descartado por absoluto; **"message bus externo"** — sobredimensionado para greenfield solo.
- **"Solo borde" / "solo dominio"** (§3.4) — descartados: menos robustos que defensa en profundidad.

## Consecuencias

**Positivas:** contrato de API estable; dominio puro y testeable; use-cases reusables fuera de HTTP; validación robusta.

**Negativas / trade-offs:** mapeo input/output explícito (más código); coordinación cross-slice manual hasta que se resuelva el Pending de §3.2.

## Relacionados

- `depende-de` → [layers-and-dependencies.md](layers-and-dependencies.md) — el borde cross-slice usa el read-port del consumidor definido ahí.
- `relacionado-con` → [read-models-for-lists.md](read-models-for-lists.md) — los read models planos que cruzan el borde de módulo.
- `relacionado-con` → [folder-structure.md](folder-structure.md) — naming de los DTOs y del port.
