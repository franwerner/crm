# ADR 05 — Inyección de dependencias

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-20 (mecánica del wiring: composition root distribuido en `infrastructure/bootstrap.ts` por slice + `src/app.ts` global como orquestador)
- **Decisores:** ifran
- **Fase del bootstrap:** 5.1

## Contexto

Hono NO provee DI. Algo tiene que cablear el adapter concreto (`*.repository.bun.ts`) dentro del use-case. Es un solo dev en greenfield.

## Decisión

**Inyección manual en un composition root DISTRIBUIDO.** Sin librería de container. El wiring se reparte así:

- **Por slice — `src/modules/<m>/infrastructure/bootstrap.ts`.** Es el mini composition-root del módulo. Instancia el adapter concreto del repo, los use-cases (pasándoles el repo en el constructor), el controller (pasándole el objeto con las instancias de use-case en el constructor) y el router (pasándole el controller). Retorna `{ router, publicApi? }`. Es el ÚNICO archivo del slice (junto con `src/app.ts`) que importa `*.repository.bun.ts` y `*.public.impl.ts` de SU PROPIO módulo.
- **Global — `src/app.ts`.** Es el orquestador: llama a cada `bootstrap*` (pasándoles `db` u otra dep de borde), conecta los `publicApi` entre slices cuando hay cross-slice (`bootstrapUsers(db).publicApi → bootstrapAuth(publicApi)`), y monta los routers retornados.

Coherente con la regla #7 reescrita del ADR 02. Cada slice queda autocontenido: agregar un use-case nuevo se resuelve dentro del bootstrap del slice, sin tocar `app.ts`.

## Alternativas consideradas

- **Container (awilix):** útil con muchos módulos y wiring complejo; suma una dependencia y ceremonia que no paga a esta escala.
- **Container (tsyringe):** requiere decorators + reflect-metadata; menos afín al setup minimalista de Hono.
- **Framework-provided:** N/A — Hono no tiene DI.

## Consecuencias

**Positivas:** cero magia, cero dependencia extra, fácil de seguir y de testear (cuando se introduzcan tests). Cada slice es autocontenido: el bootstrap del módulo encapsula su wiring; `app.ts` no crece con la cantidad de use-cases del slice — sólo con la cantidad de slices.

**Negativas / trade-offs:** ahora hay dos lugares donde mirar al introducir un use-case nuevo (el archivo del use-case y el `bootstrap.ts` del slice); a cambio el wiring del módulo queda localizado y no se desparrama en `app.ts`. Reevaluar un container si `app.ts` o los `bootstrap.ts` se vuelven inmanejables (no se fija trigger formal, queda a criterio).

## Reglas concretas

- Toda construcción de adapters concretos del slice y wiring de SUS use-cases/controllers vive en `src/modules/<m>/infrastructure/bootstrap.ts`. Si un slice no tiene repo propio (ej. `auth`), igual existe `infrastructure/bootstrap.ts` — es la única razón por la que se permite la carpeta `infrastructure/` sin adapter.
- `src/app.ts` instancia las deps de borde (`db`), llama a cada `bootstrap*`, conecta cross-slice por `publicApi` y monta los routers. NO instancia use-cases ni adapters directamente.
- Los use-cases reciben sus dependencias por constructor (`private readonly`); el método público es `execute(input)`. Nunca instancian sus dependencias.
- Los controllers reciben las instancias de use-case por constructor (`constructor(ucs: <Entity>UseCases)`). Nunca instancian use-cases.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-17 | Decisión inicial | ifran |
| 2026-05-20 | **Composition root distribuido.** El wiring se mueve de un único `src/app.ts` a un esquema (a) `src/modules/<m>/infrastructure/bootstrap.ts` por slice — mini composition-root autocontenido que retorna `{ router, publicApi? }` —, (b) `src/app.ts` orquesta llamando a los `bootstrap*`, conectando `publicApi` cross-slice y montando los routers. Motivo: autocontención del módulo (use-cases nuevos no obligan a tocar `app.ts`) y coherencia con el refactor a class de use-cases/controllers (ADR 03 §3.1, ADR 02 regla #3). `.dependency-cruiser.js`: rules 4 y 7 actualizadas para reconocer `infrastructure/bootstrap.ts` como punto de wiring del slice. Aplicado a contacts, users y auth. | ifran |
