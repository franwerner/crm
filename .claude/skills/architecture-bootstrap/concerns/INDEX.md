# Catálogo de fases (concerns) — Índice

Menú de fases que la skill puede recorrer. El motor (`SKILL.md`) lee este índice **una sola vez** para armar la lista de fases relevantes según el tipo de proyecto (Fase 0), y recién después lee el archivo individual de cada fase que se va a tratar. Así no carga al contexto fases que no aplican.

## Cómo lo usa el motor

1. Fase 0 detecta el tipo de proyecto → lo mapea a un token de abajo.
2. El motor recorre la matriz y arma dos grupos:
   - **Requerido** → se incluye por default (el usuario puede marcarlo `Not Applicable` con razón).
   - **Recomendado** → se sugiere; el usuario decide.
3. Muestra el set; el usuario elige qué definir ahora, y puede agregar una **fase custom** (ver abajo).
4. Por cada fase elegida, el motor lee `concerns/<slug>.md` y la trata con las reglas del motor.
5. Las relevantes NO elegidas → ADR `Not Applicable` / `Pending` + razón. Nunca hueco silencioso.

## Tokens de tipo de proyecto

`api-rest` · `api-graphql` · `cli` · `libreria` · `web-spa` · `web-ssr` · `microservicio` · `monolito-modular` · `script`

`todos` = cualquier tipo.

## Fase custom

Si el usuario tiene un tema fuera de este catálogo, el motor le hace las preguntas genéricas, crea `concerns/<slug>.md` con el formato estándar y suma la fila acá. Antes de guardarlo pregunta: **¿reusable (queda en el catálogo para futuros proyectos) o solo para este proyecto (solo genera el ADR)?**

## Leyenda

- **Prof.** = profundidad: `deep` (cuestionario propio) · `light` (1-2 preguntas).
- ✎ = archivo de fase ya creado (muestra de formato). El resto se crea en el build completo, mismo formato.

---

## Matriz

### Contexto

| Fase | Prof. | Requerido para | Recomendado para |
|---|---|---|---|
| context | deep | todos (entrada, siempre primero) | — |

### Estructura y diseño

| Fase | Prof. | Requerido para | Recomendado para |
|---|---|---|---|
| architecture-style | deep | todos salvo `script` | `script` |
| layers-and-dependencies | deep | los que eligieron un patrón en architecture-style | — |
| inter-layer-communication | deep | proyectos con capas (Clean / Layered / Hexagonal) | `monolito-modular` |
| folder-structure | light | todos | — |

### Robustez / runtime

| Fase | Prof. | Requerido para | Recomendado para |
|---|---|---|---|
| [error-handling](error-handling.md) ✎ | deep | todos | — |
| concurrency-async | light | `microservicio`, `api-rest`, `api-graphql` | `web-ssr`, `cli` |
| background-jobs | light | — | `api-rest`, `api-graphql`, `microservicio`, `web-ssr` |
| resilience | light | `microservicio` | `api-rest`, `api-graphql` |
| [caching](caching.md) ✎ | light | — | `api-rest`, `web-ssr`, `microservicio` |

### Datos

| Fase | Prof. | Requerido para | Recomendado para |
|---|---|---|---|
| data-access | deep | proyectos con persistencia | — |
| data-modeling | light | proyectos con persistencia | — |

### Observabilidad

| Fase | Prof. | Requerido para | Recomendado para |
|---|---|---|---|
| logging | light | todos | — |
| metrics | light | `microservicio` | `api-rest`, `api-graphql`, `web-ssr` |
| tracing | light | `microservicio` | `api-rest` distribuidas |
| health-checks | light | `microservicio` | `api-rest`, `web-ssr` |

### Seguridad

| Fase | Prof. | Requerido para | Recomendado para |
|---|---|---|---|
| auth | deep | proyectos con usuarios / expuestos a red | — |
| authorization | light | donde aplica auth | — |
| input-validation | light | `api-rest`, `api-graphql`, `web-ssr`, `web-spa` | — |
| rate-limiting | light | APIs públicas | `microservicio` |
| cors | light | APIs consumidas por browser | — |
| secrets-management | light | proyectos con secretos | — |
| dependency-scanning | light | — | todos los productivos |

### Contrato / interfaz

| Fase | Prof. | Requerido para | Recomendado para |
|---|---|---|---|
| api-contract | light | `api-rest`, `api-graphql`, `microservicio` | — |
| cli-contract | light | `cli` | — |
| library-contract | light | `libreria` | — |
| event-contract | light | sistemas event-driven / `microservicio` que publica eventos | `api-rest` con webhooks |

### Operación / entrega

| Fase | Prof. | Requerido para | Recomendado para |
|---|---|---|---|
| configuration | light | todos | — |
| dependency-injection | deep | donde architecture-style usa DI | — |
| testing-strategy | deep | todos | — |
| arch-enforcement | light | donde hay capas / reglas de dependencia definidas | — |
| ci-quality-gates | light | — | todos los productivos |
| deployment-topology | light | `microservicio`, `api-rest`, `web-ssr`, `web-spa` | — |
| documentation | light | — | todos los productivos |
| feature-flags | light | — | `microservicio`, `api-rest`, `web-ssr`, `web-spa` |

### Frontend / UI

| Fase | Prof. | Requerido para | Recomendado para |
|---|---|---|---|
| accessibility | light | `web-spa`, `web-ssr` | — |

### Calidad / NFRs

| Fase | Prof. | Requerido para | Recomendado para |
|---|---|---|---|
| nfr-performance | light | — | servicios / APIs |
| scalability | light | `microservicio` | APIs de alta escala |
| i18n-l10n | light | — | apps user-facing |

---

## Mantenimiento

- **Agregar una fase (ratchet):** crear `<slug>.md` con el formato estándar (ver `error-handling.md`) y sumar la fila en la categoría que corresponda. Un tema olvidado se agrega UNA vez y queda cubierto para todos los proyectos futuros.
- **Origen del catálogo:** sembrado de ISO/IEC 25010, 12-factor, arc42 §8/§10, OWASP ASVS y checklists de production-readiness. No se arma de memoria — por eso nace casi completo y solo crece.
