# ADR — Logging

- **Status:** Pending
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase:** logging

## Contexto

`error-handling.md` §4.5 definió una política de logging de errores (5xx con stack, scrubbing de PII, correlación por request-id). Esa política necesita una infraestructura de logging para materializarse.

## Razón de omisión / aplazamiento

**Status:** Pending

El usuario decidió no introducir logging por el momento (greenfield, prototipo local).

- **Trigger esperado:** cuando se opere `app/api` en un entorno real / deje de ser prototipo local (deploy, múltiples usuarios, necesidad de observabilidad).

> **Dependencia con `error-handling.md` §4.5:** la política de logging de errores existe como **contrato vigente** pero NO puede aplicarse mientras este ADR esté Pending. Al pasar a `Accepted`, la política de §4.5 se vuelve obligatoria de inmediato. No asumir que el logging de errores ya está activo.

## Alternativas consideradas

- JSON estructurado con `pino` + middleware de `request-id` (recomendado por el asistente) — no elegido ahora.
- Otra librería estructurada (winston / logger nativo de Bun) — no evaluada en profundidad.
- Texto plano simple — descartado para una API real.

## Consecuencias

Pendiente de evaluación cuando se tome la decisión. Mientras tanto: sin trazabilidad operacional; la política de PII-safe de `error-handling.md` §4.5 queda inerte.

## Reglas concretas (si aplica)

Ninguna mientras esté Pending. Al resolverse: definir librería, formato (JSON estructurado recomendado), niveles, y correlación request-id; aplicar el scrubbing de PII del `error-handling.md` §4.5.
