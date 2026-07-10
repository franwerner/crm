# EDR — Gramática de filtros en endpoints de listado

- **Status:** Accepted
- **Type:** convention
- **Date:** 2026-05-24

## Contexto

Los endpoints de listado necesitan filtrado expresivo que permita combinar condiciones con OR entre grupos de condiciones. El esquema anterior soportaba solo un grupo de condiciones ANDadas (forma plana `filter[field][op]=value`). Con el crecimiento del CRM aparecen casos que requieren cruce de OR: ej. "contactos en estado A o en estado B con interés alto". La gramática debe tener profundidad fija para evitar complejidad arbitraria y preservar la predecibilidad del costo de las queries en la base de datos.

## Decisión

**DNF (Disjunctive Normal Form) de profundidad 2:** las condiciones se ANDan dentro de un grupo; los grupos se combinan con OR. No hay recursión.

### Gramática del wire format

**Grupo único (backward compatible — comportamiento anterior sin cambios):**

```
filter[field][op]=value
```

Forma un solo grupo AND. Produce `WHERE field op value` (o AND de condiciones si hay varios campos).

**Grupos múltiples con OR:**

```
filter[field][op]=value&filter[or][0][field2][op2]=value2
```

Los grupos top-level (bare `filter[field]`) y cada `filter[or][i]` se combinan con OR a nivel SQL.

### Semántica

- Las condiciones dentro de un grupo se ANDan.
- Los grupos se combinan con OR.
- Un solo grupo (sin `or`) es equivalente al comportamiento anterior — compatibilidad total.
- El resultado en SQL es: `WHERE guards AND (g1 OR g2 ...) AND search`.

### Invariante de soft-delete

El guard de soft-delete y la cláusula de búsqueda de texto se combinan con AND **fuera** del bloque OR de grupos. La estructura es siempre:

```
guard soft-delete  AND  (g1 OR g2 ...)  AND  búsqueda
```

Esto garantiza que los filtros OR nunca aflojen el guard de soft-delete ni el de búsqueda. Si el guard de soft-delete terminara dentro del OR, registros eliminados podrían ser visibles cuando otra rama del OR los incluyera.

### Caps (límites anti-DoS)

| Límite | Valor | Razón |
|---|---|---|
| Grupos OR máximos | 10 | Limita el número de ramas OR del plan de ejecución; cada rama puede ejecutar un index scan distinto. |
| Condiciones AND por grupo máximas | 25 | Evita queries con decenas de predicados que degradan el planner. |

Los caps se aplican en la capa de validación (Zod), antes de llegar al repositorio. Una violación lanza `ValidationError` (400).

### Nombre OpenAPI del grupo

El objeto de grupo (usado en el array `or`) se registra con un nombre estable en el contrato OpenAPI (`FilterGroupObject`), para que kubb genere un tipo nombrado sin inline anónimo.

## Reglas verificables

- **[manual]** Todo endpoint de listado que use el query builder compartido (`buildListQuerySchema`) obtiene la gramática DNF de profundidad 2 automáticamente.
- **[manual]** El guard de soft-delete (`deletedAt IS NULL`) y la búsqueda de texto se combinan con AND **fuera** del bloque OR; nunca dentro. Los helpers de composición (`combineWhere` / `applyFilterGroups` en `src/shared/db/drizzle-filters.ts`) mantienen esa estructura.
- **[manual]** Los caps `MAX_OR_GROUPS` (10) y `MAX_CONDITIONS_PER_GROUP` (25), exportados desde `src/shared/types/filters.ts` y aplicados en `buildListQuerySchema`, son globales; no se modifican por slice. Cambiarlos requiere actualizar este EDR.
- **[manual]** El nombre OpenAPI del objeto de grupo (`FilterGroupObject`) es estable; no se renombra sin coordinar con kubb en el paquete de UI.

## Alternativas consideradas

- **Recursión arbitraria (árbol de AND/OR):** expresividad máxima pero costo de query impredecible y parsing complejo. Descartado a favor de profundidad 2 fija.
- **Solo OR de campos simples (sin grupos):** `filter[or][field]=value` sin soporte de AND intragrupo. Demasiado restrictivo para combinaciones reales. Descartado.
- **Formato JSON en el body:** rompería la semántica REST de GET y el bookmarking/sharing de URLs. Descartado.
- **Caps más altos** (50 grupos o 100 condiciones): el riesgo de DoS en la capa de planner es real; 10 grupos y 25 condiciones cubren todos los casos identificados. Descartado.

## Consecuencias

**Positivas:**
- Backward compatible: el wire format anterior sigue funcionando sin cambios en callers.
- Expresividad suficiente para los casos del CRM con profundidad fija.
- Los caps protegen el planner contra abusos.
- La invariante de soft-delete es explícita y verificable en code review.

**Negativas / trade-offs:**
- No soporta OR dentro de un grupo: `(a AND b) OR (a AND c)` se puede expresar, pero no `(a OR b) AND c`. Ese patrón (AND-of-ORs) queda fuera de la gramática; si aparece, se reevalúa este EDR.
- El límite de 10 grupos puede ser restrictivo si aparecen reportes con muchos estados combinados — se ajusta entonces con evidencia.

## Relacionados

- `depende-de` → [api-contract.md](api-contract.md) — el wire format y el tipo de grupo se exponen en el OpenAPI que consume kubb.
- `relacionado-con` → [sort.md](sort.md) — comparte el query builder de listados.
