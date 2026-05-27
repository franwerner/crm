# ADR — Gramática de filtros en endpoints de listado

- **Status:** Accepted
- **Fecha de creación:** 2026-05-24
- **Última actualización:** 2026-05-24
- **Decisores:** ifran
- **Fase:** filter-grammar

## Contexto

Los endpoints de listado (ej. `GET /contacts`) necesitan filtrado expresivo que permita combinar condiciones con OR entre grupos de condiciones. El sistema anterior soportaba solo un grupo de condiciones ANDadas (forma plana `filter[field][op]=value`). Con el crecimiento del CRM aparecen casos de uso que requieren cruce de OR: ej. "contactos en estado A o en estado B con interés alto".

La gramática debe tener profundidad fija para evitar complejidad arbitraria y preservar la predecibilidad del costo de las queries en la base de datos.

## Decisión

**DNF (Disjunctive Normal Form) de profundidad 2:** las condiciones se ANDan dentro de un grupo; los grupos se combinan con OR. No hay recursión.

### Gramática del wire format

**Grupo único (backward compatible — comportamiento anterior sin cambios):**

```
filter[field][op]=value
```

Esto forma un solo grupo AND. Produce `WHERE field op value` (o AND de condiciones si hay varios campos).

**Grupos múltiples con OR:**

```
filter[field][op]=value&filter[or][0][field2][op2]=value2
```

Los grupos top-level (bare `filter[field]`) y cada `filter[or][i]` se combinan con OR a nivel SQL:

```sql
WHERE (deletedAt IS NULL) AND ((field op value) OR (field2 op2 value2)) AND search
```

### Semántica

- Las condiciones dentro de un grupo se ANDan.
- Los grupos se combinan con OR.
- Un solo grupo (sin `or`) es equivalente al comportamiento anterior — compatibilidad total.
- El resultado en SQL es: `WHERE guards AND (g1 OR g2 ...) AND search`.

### Invariante de soft-delete

El guard `deletedAt IS NULL` y la cláusula de búsqueda de texto se combinan con `combineWhere` (AND) FUERA del OR de grupos. La estructura es siempre:

```
combineWhere([
  isNull(deletedAt),          -- guard: AND
  applyFilterGroups(...),     -- (g1 OR g2 ...) como bloque
  applySearch(...),           -- AND
])
```

Esto garantiza que los filtros OR nunca aflojen el guard de soft-delete ni el de búsqueda. Si `deletedAt IS NULL` terminara dentro del OR, registros eliminados podrían ser visibles cuando otra rama del OR los incluyera.

### Caps (límites anti-DoS)

| Constante | Valor | Razón |
|---|---|---|
| `MAX_OR_GROUPS` | 10 | Limita el número de ramas OR del plan de ejecución; cada rama puede ejecutar un index scan distinto. |
| `MAX_CONDITIONS_PER_GROUP` | 25 | Limita el número de condiciones AND por grupo; evita queries con decenas de predicados que degradan el planner. |

Ambas constantes se exportan desde `src/shared/types/filters.ts` y se aplican en `buildListQuerySchema` (capa de Zod, antes de llegar al repositorio). Una violación lanza `ValidationError` (400).

### Módulos afectados

| Módulo | Capa | Cambio |
|---|---|---|
| `src/shared/types/filters.ts` | Shared types | `FilterGroup = Filter[]`; `ListQuery.filterGroups: FilterGroup[]`; exports de caps |
| `src/shared/db/list-query-schema.ts` | Shared DB | Zod schema con `or` opcional; transform que construye `FilterGroup[]` |
| `src/shared/db/drizzle-filters.ts` | Shared DB | `applyFilterGroup`, `applyFilterGroups` |
| `src/modules/contacts/infrastructure/contact.repository.bun.ts` | Infrastructure | Usa `applyFilterGroups` con invariante de soft-delete |
| `src/shared/http/list-query.ts` | Shared HTTP | Legacy schema actualizado a `filterGroups` en el transform |

### Nombre OpenAPI del grupo

El schema del objeto de grupo (usado en el array `or`) se registra con nombre `FilterGroupObject` via `.openapi('FilterGroupObject')`. Esto produce un tipo nombrado en el contrato OpenAPI que kubb puede generar sin inline anónimo.

## Alternativas consideradas

- **Recursión arbitraria (árbol de AND/OR):** expresividad máxima pero costo de query impredecible y parsing complejo. Descartado a favor de profundidad 2 fija.
- **Solo OR de campos simples (sin grupos):** `filter[or][field]=value` sin soporte de AND intragrupo. Demasiado restrictivo para combinaciones reales. Descartado.
- **Formato JSON en el body:** rompería la semántica REST de GET y la capacidad de bookmarking/sharing de URLs. Descartado.
- **Caps más altos:** 50 grupos o 100 condiciones. El riesgo de DoS en la capa de planner de Postgres es real; 10 grupos y 25 condiciones son suficientes para todos los casos de uso identificados. Descartado.

## Consecuencias

**Positivas:**
- Backward compatible: el wire format anterior sigue funcionando sin cambios en callers.
- Expresividad suficiente para los casos de uso del CRM con profundidad fija.
- Caps protegen el planner de Postgres contra abusos.
- La invariante de soft-delete se documenta y es verificable en code review.

**Negativas / trade-offs:**
- No soporta OR dentro de un grupo (ej. `(a AND b) OR (a AND c)` se puede expresar, pero no `(a OR b) AND c`). Para ese patrón se necesitaría AND-of-ORs, que está fuera de la gramática. Si aparece ese caso, se reevalúa el ADR.
- El límite de 10 grupos puede ser restrictivo si aparecen reportes con muchos estados combinados — se ajusta entonces con evidencia.

## Reglas concretas

- Todo endpoint de listado que use `buildListQuerySchema` obtiene la gramática DNF automáticamente.
- El guard de soft-delete y la búsqueda de texto siempre se combinan FUERA del bloque OR.
- Los caps `MAX_OR_GROUPS` y `MAX_CONDITIONS_PER_GROUP` no se modifican por slice; son globales. Cambio requiere actualizar este ADR.
- El nombre OpenAPI `FilterGroupObject` es estable; no se renombra sin coordinar con kubb en `app/ui`.
