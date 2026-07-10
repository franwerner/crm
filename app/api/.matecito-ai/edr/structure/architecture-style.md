# EDR — Estilo arquitectónico y acoplamiento

- **Status:** Accepted
- **Type:** decision
- **Date:** 2026-05-17

## Contexto

El framework HTTP elegido no impone arquitectura (solo routing + middleware), así que el estilo lo definimos nosotros. El dominio de un CRM crece y se compone de módulos relativamente independientes (customers, deals, activities, pipeline). Es un solo dev en greenfield.

## Decisión

- **Patrón:** **Vertical Slice / por feature**. Se organiza por feature, no por capa técnica global. Cada slice contiene su propia presentación, lógica y acceso a datos.
- **Acoplamiento:** **Pragmático** — interfaces SOLO en los bordes de I/O (repositorios de DB, HTTP externo, filesystem). El resto, código concreto.
- **Disciplina interna del slice (no negociable):** Vertical Slice NO significa "el handler hace todo". El handler HTTP es fino (traduce request → input); la lógica de negocio vive en un use-case que NO conoce el framework HTTP y habla con la DB a través de una abstracción. Cohesión por feature, lógica testeable sin levantar el framework.

## Alcance

- `src/modules/*/http/*.routes.ts` — handler HTTP fino (transporte), uno por slice.
- `src/modules/*/application/use-cases/**` — lógica de negocio sin framework.
- `src/modules/*/domain/**` — dominio puro.
- `src/modules/*/infrastructure/**` — adapters concretos en el borde I/O.

## Reglas verificables

- **[manual]** cada slice mantiene handler fino + use-case sin framework + dominio puro + port de repo + adapter concreto; el handler no contiene lógica de negocio.
- **[manual]** prohibido crear una interface para una clase con una sola implementación que no sea borde I/O.
- **[tool: dependency-cruiser]** el aislamiento por capas que este estilo implica se enforcea en `layers-and-dependencies.md` (el use-case no importa el framework HTTP ni infrastructure).

## Alternativas consideradas

- **Clean / Hexagonal estricto** — más pureza pero más ceremonia que la que paga para esta escala/solo dev.
- **Layered N-tier clásica** — la lógica tiende a filtrarse al service acoplado a infra.
- **Sin patrón formal** — deuda técnica rápida en un CRM con dominio real.

## Consecuencias

**Positivas:**
- Cohesión por feature: tocar un feature mantiene todo lo suyo junto.
- Lógica de negocio testeable y mantenible independiente del framework HTTP y la DB.

**Negativas / trade-offs:**
- Requiere disciplina para no caer en "slice plano" (handler hace todo).
- La coordinación cross-slice necesita orquestación explícita.

## Relacionados

- `relacionado-con` → [layers-and-dependencies.md](layers-and-dependencies.md) — traduce este estilo a reglas de dependencia verificables.
- `relacionado-con` → [inter-layer-communication.md](inter-layer-communication.md) — contratos entre capas y coordinación cross-slice.
