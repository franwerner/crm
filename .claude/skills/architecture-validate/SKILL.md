---
name: architecture-validate
description: Validador de coherencia, completitud y verificabilidad de las decisiones arquitectónicas (ADRs) de un proyecto. Usá esta skill cuando el usuario pida "validar la arquitectura", "revisar los ADRs", "chequear coherencia", "¿mis decisiones se contradicen?", después de editar ADRs a mano o de correr architecture-bootstrap. Lee `.claude/adr/` y reporta hallazgos con severidad. NO modifica nada — es consultiva.
---

# Architecture Validate

Lee los ADRs producidos por `architecture-bootstrap` (o editados a mano) y los chequea contra una rúbrica: **completitud**, **coherencia entre decisiones** y **verificabilidad**. Reporta hallazgos con severidad. No modifica archivos.

## Por qué contexto fresco

Esta validación SOLO sirve si es adversarial: leé únicamente lo que está ESCRITO en los ADRs. No asumas la intención del autor ni el contexto de cómo se tomó cada decisión. Lo que no está en el archivo, no existe. Por eso esta skill corre con contexto limpio (standalone, o lanzada por el bootstrap como sub-agente).

## Pre-flight

Leé `.claude/adr/INDEX.md`. Si no existe, no hay nada que validar → sugerí correr `architecture-bootstrap` y frená.

## Proceso

1. Leé `.claude/adr/INDEX.md`, todos los ADRs (`.claude/adr/*.md`) y `.claude/adr/tech/INDEX.md`.
2. Identificá el tipo de proyecto desde el ADR `context`.
3. Para el chequeo de **completitud** necesitás saber qué fases son relevantes a ese tipo:
   - Si el bootstrap te lanzó, usá la lista de fases relevantes que te pasó.
   - Si corrés standalone y podés acceder al catálogo `concerns/INDEX.md` de la skill `architecture-bootstrap`, usalo.
   - Si no tenés ninguna de las dos, marcá completitud como "no verificable" y seguí con coherencia y verificabilidad (que solo necesitan los ADRs).
4. Leé `coherence-rules.md` (en esta misma skill) y aplicá cada chequeo.
5. Emití el reporte.

## Formato del reporte

Agrupado por severidad. Para cada hallazgo: **qué**, en **qué ADRs**, **por qué**, y una **sugerencia de resolución**.

```
🔴 CRITICAL — contradicen la arquitectura; hay que resolverlas.
🟡 WARNING  — inconsistencias o riesgo de pudrición.
🔵 SUGGESTION — mejoras de claridad o robustez.
```

Si un nivel no tiene hallazgos, decilo explícitamente ("Sin CRITICAL"). Cerrá con un veredicto de una línea (ej: "2 CRITICAL, 1 WARNING — resolver los CRITICAL antes de empezar a codear").

## Después del reporte

- **No modifiques ADRs.** Si el usuario quiere resolver un hallazgo, derivá a `architecture-bootstrap` en modo update para el ADR afectado.
- **Ratchet:** si detectaste una contradicción real que NO está en `coherence-rules.md`, ofrecé agregarla a la rúbrica para que se atrape en el futuro.

## Anti-patterns

- ❌ Inferir intención no escrita para "salvar" una contradicción → si no está en el ADR, es un hallazgo.
- ❌ Modificar o arreglar ADRs vos mismo → solo reportás; el usuario decide y resuelve vía update.
- ❌ Reportar todo como CRITICAL → reservá CRITICAL para lo que rompe la arquitectura; usá WARNING/SUGGESTION para el resto.
