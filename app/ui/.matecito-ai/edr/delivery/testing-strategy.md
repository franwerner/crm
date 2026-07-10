# EDR — Estrategia de testing (app/ui)

- **Status:** Pending
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase:** testing-strategy

## Contexto

La arquitectura (container/presentational, hooks, view-models) se eligió pensando en testeabilidad. Sin embargo, la decisión de proyecto fue arrancar sin tests.

## Razón de omisión / aplazamiento

**Status:** Pending

Consistente con la decisión ya tomada en `app/api` `testing-strategy.md`: el proyecto arranca **sin tests** por elección consciente del usuario. No es Not Applicable — es aplazamiento, se reevalúa.

- **Trigger esperado:** cuando aparezca lógica de cliente no trivial (mapeos de view-model complejos, flujos de auth, lógica de orquestación en hooks) cuya rotura duela.

> **⚠️ CONFLICTO ACTIVO con el harness.** El entorno corre con `Strict TDD Mode: enabled` (global, `~/.claude/CLAUDE.md`). Esta decisión lo contradice. El usuario ya resolvió, a nivel proyecto, dejar el conflicto **documentado-only** (no tocar config) — ver decisión equivalente en `app/api` `testing-strategy.md`. No re-litigar; está cerrado conscientemente.

## Alternativas consideradas

- Definir testing ahora (Vitest + React Testing Library + Playwright) — recomendado por el asistente, no elegido.
- Mantener TDD coherente con el harness — no elegido (decisión de proyecto).

## Consecuencias

Pendiente de evaluación. Riesgo conocido: cambios sin red de seguridad en un CRM con flujos de auth y datos sensibles.

## Reglas concretas (si aplica)

Ninguna mientras Pending. Al resolverse: definir runner (Vitest natural con Vite), React Testing Library para componentes/hooks, e2e (Playwright), y reconciliar con `Strict TDD Mode`.
