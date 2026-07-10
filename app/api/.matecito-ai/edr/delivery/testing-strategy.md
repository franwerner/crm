# EDR — Estrategia de testing

- **Status:** Pending
- **Type:** decision
- **Date:** 2026-05-17

## Contexto

Toda la arquitectura (dominio puro, puertos junto al use-case, acoplamiento pragmático) se diseñó pensando en testeabilidad. Sin embargo, se decidió arrancar el paquete sin tests y sin TDD.

## Razón de omisión / aplazamiento

**Status:** Pending

El usuario decidió, de forma consciente y tras pushback técnico explícito (dado dos veces), arrancar el paquete **sin tests por ahora**. No es "decidido que no aplica" (Not Applicable) — es un aplazamiento: se reevaluará.

- **Trigger esperado:** cuando aparezca lógica de negocio no trivial (cálculos, reglas de deals, permisos) cuya rotura duela.
- **Distinción registrada:** "sin TDD" (workflow, no test-first) ≠ "sin tests" (sin red de seguridad). Se optó por lo segundo *por ahora*; el riesgo (refactors sin red en un sistema con dominio real: deals, plata, permisos, PII) fue explicado y asumido.
- **Conflicto con el harness (RESUELTO — 2026-05-17):** el `~/.claude/CLAUDE.md` global declara `Strict TDD Mode: enabled` para todos los proyectos. Se resolvió la incoherencia mediante un **override de alcance proyecto** documentado en `app/api/CLAUDE.md`: para `crm/app/api` Strict TDD está DESACTIVADO, en coherencia con este aplazamiento. El global queda intacto (sin impacto sobre otros repos). El aplazamiento del testing sigue vigente; lo que se resolvió es la coherencia operativa, no la decisión de testear.
- **Al resolverse:** definir runner (`bun test` es el natural), pirámide, mocks vs fakes vs testcontainers, cobertura, y reconciliar con `Strict TDD Mode`. Una estrategia de testing completa fue recomendada por el asistente y no elegida; tampoco "solo tests críticos" ni "mantener TDD coherente con el harness".
