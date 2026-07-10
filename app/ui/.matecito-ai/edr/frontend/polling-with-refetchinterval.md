# EDR — Polling de estado con `refetchInterval` condicional

- **Status:** Accepted
- **Fecha de creación:** 2026-06-17
- **Última actualización:** 2026-06-17
- **Decisores:** ifran
- **Fase:** polling-with-refetchinterval

## Contexto

La Fase 3 introdujo el primer trabajo asíncrono visible en la UI: el procesamiento de una ingesta (`imports`) y el enriquecimiento de un contacto (`enrichment` insights) corren en un worker del backend (`app/api` `../../../app/api/.matecito-ai/edr/runtime/background-jobs.md`) y avanzan por estados (`queued`/`processing` → `completed`/`failed`) después de que la UI dispara la operación. La pantalla tiene que reflejar el avance sin que el usuario recargue: una ingesta muestra `processedRows/totalRows` y termina en un estado terminal; un insight muestra el resultado cuando deja de estar `processing`.

Hasta ahora ninguna pantalla necesitaba refrescar datos por sí sola — todo el read era a demanda (navegación, invalidación tras una mutation). Faltaba fijar **cómo** se hace polling de un recurso que cambia server-side, dado que el data-access del paquete es kubb + TanStack Query (`../data/data-access.md`) y los hooks generados son read-only. El backend **no** expone SSE/WebSocket (`../../../app/api/.matecito-ai/edr/contracts/event-contract.md` N/A): el único canal de actualización es re-pedir el recurso.

## Decisión

El polling de un recurso que avanza server-side se hace con la opción **`refetchInterval` de TanStack Query**, no con un `setInterval` manual, y se configura en el **hook wrapper de feature** que envuelve al hook generado por kubb, nunca en el componente.

1. **`refetchInterval` como función condicional.** Se pasa `refetchInterval` como **función** `(query) => number | false`, no como número fijo. La función lee el `status` del último dato y devuelve:
   - el intervalo en ms mientras el estado **no** sea terminal,
   - `false` cuando llega a un estado **terminal** → el polling se apaga solo.
   Estados terminales: `completed`/`failed` para un insight de enrichment; el estado terminal de la ingesta (completada/fallida) para un import. Un dato `undefined` (primer fetch en vuelo) mantiene el intervalo activo.
2. **Vive en el hook wrapper de feature.** El intervalo se configura en `features/<f>/hooks/use-<x>-status.ts` (ej. `features/imports/hooks/use-import-status.ts`, `features/contacts/hooks/use-insight-status.ts`), que envuelve al hook generado read-only (`useGetEnrichmentsId`, el hook de estado de import) y le pasa `refetchInterval`. El componente solo consume el wrapper; no conoce el polling. Coherente con `../data/data-access.md` (los generados son read-only; la política de fetching se compone en el wrapper de feature).
3. **Intervalo.** ~2000 ms por defecto (imports). Para insights de enrichment se admite un intervalo algo mayor (~3000 ms) por ser un proceso más lento. El valor concreto vive en una constante del wrapper; no se hardcodea disperso.
4. **Sin SSE / WebSocket.** No se introduce un canal push. El backend no lo expone y el costo de un transporte en tiempo real no se justifica para procesos de pocos segundos con baja concurrencia. Si en el futuro hace falta latencia menor o muchos jobs concurrentes, se reabre esta decisión.

## Alternativas consideradas

- **`setInterval` manual en el componente** (o en un `useEffect`) que reinvoca el fetch y limpia el timer al desmontar — descartado: reimplementa a mano lo que `refetchInterval` ya hace (pausa en background tab, dedupe, limpieza en unmount, integración con el cache), y dispersa la lógica de parada en el componente. El bug clásico (timer que no se limpia al llegar a terminal) reaparece.
- **`refetchInterval` con número fijo** — descartado: nunca se apaga; sigue pegándole al backend después de que el job terminó. La función condicional es la que cierra el loop.
- **Invalidar manualmente la query con un timer global** — descartado: misma desventaja que el `setInterval` manual, además de invalidar de más.
- **SSE / WebSocket (push real)** — descartado por YAGNI: el backend no lo expone, agrega infraestructura y un contrato de eventos para procesos cortos. Trigger de reevaluación: necesidad de latencia sub-segundo o gran volumen de jobs concurrentes.

## Consecuencias

**Positivas:**
- El polling se apaga solo al llegar a estado terminal: cero requests de más una vez que el job terminó.
- La política de fetching queda encapsulada en el hook wrapper; el componente es agnóstico.
- Se reutiliza la maquinaria de TanStack Query (pausa en pestaña en background, dedupe, limpieza en unmount) sin código de timers propio.
- Patrón único y reutilizable para cualquier recurso futuro con estado server-side.

**Negativas / trade-offs:**
- El polling tiene latencia del orden del intervalo (no es tiempo real). Aceptable para procesos de pocos segundos.
- Mientras hay un job activo se generan requests periódicos al backend; mitigado por el apagado en terminal y por intervalos conservadores.
- La detección de "terminal" depende de que el wrapper conozca los estados terminales del recurso; si el backend agrega un estado terminal nuevo hay que actualizar el wrapper (no hay enforcement automático).

## Reglas concretas

- **Patrón de polling:** `refetchInterval` de TanStack Query como **función condicional** `(query) => number | false`, que devuelve `false` en estado terminal. Prohibido `setInterval`/`useEffect` con timers manuales para refrescar un recurso.
- **Ubicación:** la opción se configura en el hook wrapper de feature `features/<f>/hooks/use-<x>-status.ts`, que envuelve el hook generado read-only de `shared/api`. Nunca en el componente ni en `shared/api` (generado).
- **Estados terminales:**
  - import → su estado terminal (completada / fallida).
  - enrichment insight → `completed` / `failed`.
- **Intervalo:** ~2000 ms (imports); ~3000 ms (insights). Constante en el wrapper, no hardcodeado en varios lugares.
- **Sin push:** no introducir SSE/WebSocket sin reabrir esta decisión.

## Ejemplos en el código

- `app/ui/src/features/imports/hooks/use-import-status.ts` — polling del estado de una ingesta (~2000 ms, off en terminal).
- `app/ui/src/features/contacts/hooks/use-insight-status.ts` — polling del estado de un insight (~3000 ms, off en `completed`/`failed`).
