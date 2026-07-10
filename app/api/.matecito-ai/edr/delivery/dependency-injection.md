# EDR — Inyección de dependencias

- **Status:** Accepted
- **Type:** decision
- **Date:** 2026-05-17

## Contexto

El framework web (Hono) no provee DI. Algo tiene que cablear el adapter concreto dentro del use-case. El contexto es un solo desarrollador en greenfield.

## Decisión

**Inyección manual en un composition root DISTRIBUIDO.** Sin librería de container. El wiring se reparte así:

- **Por slice.** Cada módulo tiene su mini composition-root en infraestructura. Instancia los adapters concretos del slice (repositorios y read-ports, incluidos los que leen datos de otro módulo del schema compartido), los use-cases (pasándoles sus dependencias por constructor), el controller (pasándole las instancias de use-case) y el router (pasándole el controller). Retorna el router. Es el único archivo del slice (junto con el bootstrap global) que importa los adapters concretos de su propio módulo.
- **Global.** Un orquestador que llama a cada bootstrap de slice (pasándole las dependencias de borde, p. ej. el cliente de DB) y monta los routers retornados. NO conecta lecturas cross-slice: cada slice resuelve sus lecturas cross-módulo con su propio read-port sobre el schema compartido.

Cada slice queda autocontenido: agregar un use-case nuevo se resuelve dentro del bootstrap del slice, sin tocar el orquestador global.

## Alcance

- `src/modules/**/infrastructure/bootstrap.ts` — mini composition-root del slice; única sede (junto con el bootstrap global) que instancia los adapters concretos del módulo.
- `src/app.ts` — composition root global: instancia las dependencias de borde, llama a cada bootstrap y monta los routers.

## Reglas verificables

- **[manual]** toda construcción de adapters concretos del slice y el wiring de sus use-cases/controllers vive en `src/modules/<m>/infrastructure/bootstrap.ts`. Un slice sin repo propio igual tiene su `bootstrap.ts` — es la única razón por la que se permite una carpeta `infrastructure/` sin adapter.
- **[manual]** `src/app.ts` instancia las dependencias de borde, llama a cada bootstrap y monta los routers; NO instancia use-cases ni adapters directamente, ni conecta lecturas entre slices.
- **[manual]** los use-cases reciben sus dependencias por constructor (`private readonly`) y nunca las instancian; el método público es `execute(input)`.
- **[manual]** los controllers reciben las instancias de use-case por constructor y nunca las instancian.

## Alternativas consideradas

- **Container (awilix):** útil con muchos módulos y wiring complejo; suma una dependencia y ceremonia que no paga a esta escala.
- **Container (tsyringe):** requiere decorators + reflect-metadata; menos afín al setup minimalista del framework web.
- **Framework-provided:** N/A — Hono no tiene DI.

## Consecuencias

**Positivas:** cero magia, cero dependencia extra, fácil de seguir y de testear (cuando se introduzcan tests). Cada slice es autocontenido: el bootstrap del módulo encapsula su wiring; el composition root global no crece con la cantidad de use-cases del slice, solo con la cantidad de slices.

**Negativas / trade-offs:** hay dos lugares donde mirar al introducir un use-case nuevo (el archivo del use-case y el bootstrap del slice); a cambio el wiring del módulo queda localizado y no se desparrama en el composition root global. Reevaluar un container si el wiring se vuelve inmanejable (sin trigger formal, queda a criterio).

## Relacionados

- `relacionado-con` → [../structure/layers-and-dependencies.md](../structure/layers-and-dependencies.md) — la regla de capas que define el aislamiento de slices y la barrera de infraestructura.
