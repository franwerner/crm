# ADR — Estrategia de testing

- **Status:** Pending
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase:** testing-strategy

## Contexto

Toda la arquitectura (dominio puro, puertos junto al use-case, acoplamiento pragmático) se diseñó pensando en testeabilidad. Sin embargo, el usuario decidió arrancar el paquete sin tests y sin TDD.

## Razón de omisión / aplazamiento

**Status:** Pending

El usuario decidió, de forma consciente y tras pushback técnico explícito (dado dos veces), arrancar `app/api` **sin tests por ahora**. No es "decidido que no aplica" (Not Applicable) — es un aplazamiento: se reevaluará.

- **Trigger esperado:** cuando aparezca lógica de negocio no trivial (cálculos, reglas de deals, permisos) cuya rotura duela.
- **Distinción registrada:** "sin TDD" (workflow, no test-first) ≠ "sin tests" (sin red de seguridad). El usuario optó por lo segundo *por ahora*; el riesgo (refactors sin red en un sistema con dominio real) fue explicado y asumido.

> **✅ CONFLICTO CON EL HARNESS — RESUELTO (2026-05-17).** El `~/.claude/CLAUDE.md` global declara `Strict TDD Mode: enabled` para todos los proyectos. Se resolvió la incoherencia mediante un **override de alcance proyecto** documentado en `app/api/CLAUDE.md`: para `crm/app/api` Strict TDD está DESACTIVADO, en coherencia con esta decisión. El global queda intacto (sin radio de impacto sobre otros repos). El aplazamiento del testing sigue vigente (Status: Pending) — lo que se resolvió es la coherencia operativa, no la decisión de testear.

## Alternativas consideradas

- Incluir estrategia de testing completa ahora (pirámide, `bun test`, fakes en memoria, testcontainers) — recomendada por el asistente, no elegida.
- "Solo tests críticos" — no elegida.
- Mantener TDD coherente con el harness — no elegida.

## Consecuencias

Pendiente de evaluación cuando se tome la decisión. Riesgo conocido: cambios sin red de seguridad en un CRM con dominio real (deals, plata, permisos, PII).

## Reglas concretas (si aplica)

Ninguna mientras esté Pending. Al resolverse: definir runner (`bun test` es el natural), pirámide, mocks vs fakes vs testcontainers, cobertura, y reconciliar con `Strict TDD Mode`.
