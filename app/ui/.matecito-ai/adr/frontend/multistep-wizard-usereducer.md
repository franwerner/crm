# ADR — Wizard multi-step con `useReducer` + `Dialog`

- **Status:** Accepted
- **Fecha de creación:** 2026-06-17
- **Última actualización:** 2026-06-17
- **Decisores:** ifran
- **Fase:** multistep-wizard-usereducer

## Contexto

La ingesta de contactos (`imports`) es el primer flujo **multi-step** de la app: el usuario sube un archivo, mapea las columnas del archivo a los campos del contacto, elige opcionalmente un template de análisis, y observa el procesamiento. Son cuatro pasos encadenados (`upload → mapping → template → processing`) donde **cada paso tiene su propia mutation contra el backend** y produce datos que el siguiente necesita (el `upload` devuelve un `importId` y los headers de columnas; el `mapping` confirma el mapeo de ese `importId`).

A diferencia de un form normal (un descriptor + un submit final, `crud-ui-patterns.md` / `schema-driven-list-views.md`), acá **no hay un único submit al final**: cada paso confirma su parte de forma independiente y avanza. Hacía falta fijar cómo se modela la máquina de pasos, dónde vive el estado compartido entre pasos y cómo se monta la pantalla, sin introducir una dependencia nueva (el stack ya cierra en React + TanStack — `tech/INDEX.md`).

## Decisión

El wizard se modela con **`useReducer`** para la máquina de pasos, montado dentro de un **`Dialog`** único, con cada paso como sub-componente desacoplado que reporta su resultado vía callback.

1. **Máquina de pasos con `useReducer`.** El estado del wizard es `{ step, importId, columnHeaders, ... }` y un `reducer` puro (`wizard.reducer.ts`) traduce acciones (avanzar con los datos del paso) a transiciones de `step`. El container del wizard posee el estado compartido entre pasos (`importId`, `columnHeaders`) — el dato que un paso produce y otro consume vive en el reducer, no en cada sub-componente.
2. **Cada paso = sub-componente con `onComplete(data)`.** Cada step (`upload-step.tsx`, `mapping-step.tsx`, `template-step.tsx`, `processing-step.tsx`) es un componente independiente que recibe lo que necesita por props y expone una callback `onComplete(data)`. El container despacha la acción de avance al reducer con esos datos. El paso **no** conoce al reducer ni a los otros pasos.
3. **Mutation propia por paso.** Cada paso que escribe en el backend usa su propio hook de mutation de feature (`use-upload-import.ts`, `use-import-mapping-mutation.ts`, …), coherente con `../data/data-access.md`. **No** hay un submit final único que mande todo junto: el flujo es una secuencia de confirmaciones parciales, cada una atómica.
4. **Un solo `Dialog`.** El wizard entero vive en un `Dialog` (`shared/ui`); el cuerpo del dialog renderiza el sub-componente del `step` actual. No se navega entre rutas por paso ni se abren modales anidados.
5. **Sin dependencia nueva.** `useReducer` es de React; el `Dialog` ya existe en el design system. No se introduce ninguna librería de stepper/wizard ni `react-hook-form`.

## Alternativas consideradas

- **Librería de stepper/wizard externa** (ej. un componente multi-step de terceros) — descartada: agrega una dependencia (pisa `tech/INDEX.md`, "cero dep nueva") para resolver una máquina de 4 estados que `useReducer` cubre con un reducer chico y testeable.
- **`react-hook-form` unificado con un submit final** — descartado: el modelo de RHF asume un form con un submit que valida y envía todo junto. Acá **cada paso tiene su propia mutation** y produce datos que el siguiente necesita (`importId`); no hay un payload único final. Forzar RHF obligaría a acumular estado entre steps por fuera del form igual, sin ganar nada.
- **`useState` sueltos en el container** (un `useState` por dato + uno para el step) — descartado: las transiciones quedan implícitas y dispersas en handlers; el reducer concentra la lógica de "qué pasa al avanzar desde X" en un solo lugar puro.
- **Una ruta por paso** (`/imports/new/upload`, `/mapping`, …) — descartado: el flujo es modal y efímero (se cancela y se descarta), no merece entradas de historial ni URLs profundas; complica el guard de "no entrar al paso 2 sin haber hecho el 1".

## Consecuencias

**Positivas:**
- La lógica de transición entre pasos está concentrada en un reducer puro (`wizard.reducer.ts`), fácil de leer y de testear en aislamiento.
- Cada paso es un componente desacoplado: se entiende, modifica o reordena sin tocar a los demás (solo conoce sus props y su `onComplete`).
- Cada paso confirma su parte de forma atómica con su propia mutation; el error de un paso no contamina a los otros.
- Cero dependencia nueva: solo React + el `Dialog` existente.

**Negativas / trade-offs:**
- El estado compartido entre pasos (`importId`, `columnHeaders`) vive en el reducer del container; hay que pasarlo explícitamente por props a los pasos que lo necesitan (no hay un store global del wizard).
- No hay validación cross-step unificada (cada paso valida lo suyo). Aceptable: los pasos son secuenciales y el dato de uno habilita al siguiente.
- Si el flujo creciera mucho (muchos pasos, ramas condicionales), el reducer podría necesitar partirse; hoy con 4 pasos lineales no aplica.

## Reglas concretas

- **Patrón de wizard:** máquina de pasos con `useReducer` + reducer puro en `wizard.reducer.ts`, montado en un único `Dialog`. Prohibido introducir una librería de stepper o `react-hook-form` unificado para un flujo multi-step con mutation por paso.
- **Estado compartido entre pasos:** vive en el reducer del container (`{ step, importId, columnHeaders, ... }`). Los pasos lo reciben por props.
- **Sub-componente por paso:** en `features/<f>/components/<wizard>/steps/<x>-step.tsx`; recibe sus datos por props y reporta con `onComplete(data)`. No conoce el reducer ni a los otros pasos.
- **Mutation por paso:** cada step que escribe usa su propio hook de mutation de feature (`features/<f>/hooks/use-<x>-mutation.ts`), no hay submit final único.
- **Ubicación:** `features/<f>/components/<wizard>/{<wizard>.tsx, wizard.reducer.ts, steps/}`.

## Ejemplos en el código

- `app/ui/src/features/imports/components/import-wizard/import-wizard.tsx` — container: `useReducer` + `Dialog`, posee `importId`/`columnHeaders`.
- `app/ui/src/features/imports/components/import-wizard/wizard.reducer.ts` — reducer puro de la máquina de pasos.
- `app/ui/src/features/imports/components/import-wizard/steps/upload-step.tsx` — paso con `onComplete(data)` + mutation propia (`use-upload-import.ts`).
- `app/ui/src/features/imports/components/import-wizard/steps/mapping-step.tsx` — paso con su propia mutation (`use-import-mapping-mutation.ts`).
