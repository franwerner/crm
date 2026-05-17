# ADR 03 — Comunicación entre capas (app/ui)

- **Status:** Accepted (con sub-decisión §3.2 Zustand en Pending)
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase del bootstrap:** 3

## Contexto

Cómo viajan datos entre hooks, componentes y features en la SPA.

## Decisión

### 3.1 — Tipos de kubb vs view-model
**View-model mapeado en el hook.** El hook de feature consume el tipo generado por kubb y mapea a un view-model propio que el componente recibe por props. La UI no se ata a la forma exacta del endpoint; cambios del backend no propagan a componentes.

### 3.2 — Estado *(Accepted + sub-Pending)*
- **Estado de servidor:** SIEMPRE TanStack Query (cache, revalidación, mutaciones). Nunca duplicar en estado global.
- **Estado de cliente** (auth-state, tema, UI): React Context mínimo en `shared/`.
- **Comunicación entre features:** vía `shared/` o composición en `app/`. Nunca import feature→feature (regla #1 del ADR 02).

> **Sub-decisión Pending — Zustand.** Status: Pending. Trigger: *cuando el estado de cliente global crezca y Context degrade performance (re-renders)*.

### 3.3 — Borde de datos
Resuelto por referencia: el borde de datos es el hook de feature (ADR 02 regla #5). No se documenta como decisión separada — está cubierto.

### 3.4 — Validación de formularios
**react-hook-form + schemas zod generados por `@kubb/plugin-zod`.** La validación cliente es para UX (feedback inmediato), NO es la fuente de verdad — la API valida (`app/api` ADR 03 §3.4). Los schemas derivan del mismo OpenAPI: no se escriben a mano. Errores que solo el server conoce ("email ya existe") se muestran desde la respuesta RFC 7807 (ver ADR 04).

## Alternativas consideradas

- 3.1: tipos de kubb directo en componentes — ata la UI al endpoint.
- 3.2: Zustand desde ya / Redux — innecesario, Query maneja estado de servidor.
- 3.4: zod a mano — se desincroniza del backend; solo errores de API — UX peor.

## Consecuencias

**Positivas:** UI desacoplada del contrato; estado de servidor sin reinventar; validación derivada de una sola fuente.

**Negativas / trade-offs:** mapeo a view-model = algo más de código; Context puede degradar si crece (mitigado por sub-Pending de Zustand).

## Reglas concretas

- Server state → TanStack Query, siempre. Client state → React Context (mínimo).
- El componente recibe view-model por props, nunca el tipo crudo de kubb.
- Schemas de form: generados por kubb (read-only), conectados con `@hookform/resolvers`.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-17 | Decisión inicial. §3.2 Zustand marcado Pending con trigger | ifran |
