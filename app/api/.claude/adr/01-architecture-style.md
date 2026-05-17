# ADR 01 — Estilo arquitectónico y acoplamiento

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase del bootstrap:** 1

## Contexto

Hono no impone arquitectura (solo routing + middleware), así que el estilo lo definimos nosotros. El dominio de un CRM crece (customers, deals, activities, pipeline) y son módulos relativamente independientes. Es un solo dev en greenfield.

## Decisión

- **Patrón:** **Vertical Slice / por feature**. Se organiza por feature, no por capa técnica global. Cada slice contiene su propia presentación, lógica y acceso a datos.
- **Acoplamiento:** **Pragmático** — interfaces SOLO en los bordes de I/O (repositorios de DB, HTTP externo, filesystem). El resto, código concreto.
- **Disciplina interna del slice (no negociable):** Vertical Slice NO significa "el handler hace todo". El handler HTTP es fino (traduce request → input); la lógica de negocio vive en un use-case que NO conoce Hono y habla con la DB a través de una abstracción. Cohesión por feature, lógica testeable sin levantar el framework.

## Alternativas consideradas

- **Clean / Hexagonal estricto** — más pureza pero más ceremonia que la que paga para esta escala/solo dev.
- **Layered N-tier clásica** — la lógica tiende a filtrarse al Service acoplado a infra.
- **Sin patrón formal** — deuda técnica rápida en un CRM con dominio real.

## Consecuencias

**Positivas:**
- Cohesión por feature: tocar "deals" mantiene todo lo de deals junto.
- Lógica de negocio testeable y mantenible independiente de Hono/DB.

**Negativas / trade-offs:**
- Requiere disciplina para no caer en "slice plano" (handler hace todo).
- Coordinación cross-slice necesita orquestación explícita (ver ADR 03 §3.2).

## Reglas concretas (si aplica)

- Cada slice tiene: handler fino (`*.routes.ts`), use-case(s) sin Hono, dominio puro, puerto de repo, adapter concreto.
- Interfaces SOLO en bordes I/O. Prohibido crear una interface para una clase con una sola implementación que no sea borde I/O.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-17 | Decisión inicial | ifran |
