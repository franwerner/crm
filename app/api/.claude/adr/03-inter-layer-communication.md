# ADR 03 — Comunicación entre capas

- **Status:** Accepted (con sub-decisión §3.2 en Pending)
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase del bootstrap:** 3

## Contexto

Define cómo viajan los datos entre handler, use-case y repo dentro y entre slices.

## Decisión

### 3.1 — DTOs vs entidades en los bordes
**Mix.** La entrada SIEMPRE se valida a un input DTO antes del use-case. La salida se mapea a un response/view-model explícito. La entidad de dominio **nunca cruza el borde HTTP**. Esto desacopla el contrato público de API del modelo interno.

### 3.2 — Comunicación / side-effects  *(Accepted + sub-Pending)*
**Accepted:** comunicación síncrona directa; la coordinación cross-slice se orquesta en el composition root (coherente con regla #5 del ADR 02).

> **Sub-decisión Pending — eventos de dominio in-process.**
> Status: Pending. Trigger: *cuando la orquestación cross-slice en el composition root se vuelva un nudo (varios side-effects colgando de una operación)*. No se cierra la puerta con un "nunca"; se reevalúa cuando aparezca la necesidad real.

### 3.3 — Dónde vive el puerto del repo
**Junto al use-case (nivel application del slice).** El use-case declara la interface que necesita (`*.repository.ts`); el adapter la implementa. El dominio puro no conoce persistencia.

### 3.4 — Validación
**En ambos (defensa en profundidad).**
- **Borde:** `zod` valida forma y tipos del input crudo (¿es string?, ¿vino el campo?). Ver `tech/zod.md`.
- **Dominio:** invariantes de negocio en constructores / value objects (formato de Email, amount no negativo, etc.). Una entidad inválida debe ser imposible de construir.
- No mezclar responsabilidades: reglas de negocio NO van en el schema zod.

## Alternativas consideradas

- 3.1: "Entidades pueden cruzar" — descartado, ataría el contrato de API al modelo interno.
- 3.2: "Sin eventos nunca" — descartado por absoluto; "message bus externo" — sobredimensionado para greenfield solo.
- 3.4: "Solo borde" / "solo dominio" — descartados, menos robustos que defensa en profundidad.

## Consecuencias

**Positivas:** contrato de API estable; dominio puro y testeable; validación robusta.

**Negativas / trade-offs:** mapeo input/output explícito (más código); coordinación cross-slice manual hasta que se resuelva el Pending de §3.2.

## Reglas concretas

- Entrada: `zod` schema → input DTO tipado → use-case. (`@hono/zod-validator` en el handler.)
- Salida: use-case devuelve dato de dominio → handler mapea a view-model → JSON. La entidad no se serializa directo.
- Cross-slice: nunca import directo entre `src/modules/A` y `src/modules/B`; orquestar en `app.ts`.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-17 | Decisión inicial. §3.2 eventos in-process marcado Pending con trigger | ifran |
