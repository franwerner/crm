# ADR — CRUD UI patterns: inline para escalares, modal para colecciones de subentidades

- **Status:** Accepted
- **Fecha de creación:** 2026-05-26
- **Última actualización:** 2026-05-26
- **Decisores:** ifran
- **Fase:** crud-ui-patterns

## Contexto

El detalle de Contacts y el detalle de Projects evolucionaron con dos patrones distintos para editar/crear/eliminar datos:

- **Projects** usaba un modal por subentidad. Cada colección (`budget-items`, `expenses`, `extensions`, `responsibles`) tenía una subcarpeta con 3 archivos (`create-*-modal.tsx`, `edit-*-modal.tsx`, `delete-*-dialog.tsx`). Los 8 archivos create/edit eran ~95% boilerplate idéntico: solo cambiaban el título, el descriptor/schema/defaults del form y dos labels. El `Dialog + EntityForm` envolvente se repetía completo.
- **Contacts** usaba edición inline para todo: campos escalares del agregado (nombre, dirección, etc.) vía `contact-inline-field.tsx` + descriptores en `contact-field-mappers.ts`, y **también** para colecciones (canales, asignados) con filas que mostraban select + input editables y un botón "+ Agregar X" que toggleaba una fila ephemeral.

La inconsistencia generaba dos problemas:

1. Decidir si una pantalla nueva iba a inline o modal era arbitrario (no había regla escrita); cada feature podía elegir cualquiera.
2. Project acumulaba boilerplate que nadie abstraía. Mover un campo o agregar una subentidad implicaba copiar otro trío de archivos.

Mezclar ambos patrones tampoco se sostenía: la edición inline funciona bien para un escalar (un click, un campo, un patch), pero degrada cuando la subentidad tiene varios campos con validación (channel: tipo + valor + isPrimary; assignee: usuario + rol; budget-item: concepto + monto). Forzar inline en esos casos termina en filas con 3-4 controles + estado local de "estoy agregando uno nuevo", que es exactamente un mini-form sin las garantías de un form (validación zod, manejo de error consolidado, cancel atómico).

## Decisión

La decisión se toma sobre **la naturaleza del dato**, no sobre el aggregate:

1. **Campos escalares del agregado raíz** (atributos directos: nombre, descripción, fecha, dirección, moneda): se editan con `InlineField` (genérico, `shared/ui/inline-field.tsx`). Click-to-edit, blur/Enter confirma, Esc cancela, patch atómico de un solo campo. UX rápida, sin modales para tareas simples. Los campos se declaran en un descriptor por entidad (`features/<f>/constants/<resource>-edit.form.ts`) y se filtran en el panel por las keys editables.
2. **Colecciones de subentidades** (channels, assignees, budget-items, expenses, extensions, responsibles, y similares): se crean/editan/eliminan con un **modal de form completo**. Las filas son **read-only**, con botones Editar (lápiz) y Eliminar (papelera). Crear se hace desde un botón "+ Agregar" en el header del panel que abre el mismo modal en modo create.
3. **Componentes compartidos obligatorios** en `shared/ui/`:
   - `InlineField` — edición inline genérica sobre `<T>` (body type). Consume `FieldDef<T>`. Renderiza badge si el field tiene `badgeVariants`. Renderiza description debajo cuando está en modo edición.
   - `EntityCreateModal` — envuelve `Dialog + EntityForm`. Defaults `submitLabel="Agregar"`, `pendingLabel="Agregando…"`.
   - `EntityEditModal` — misma API; defaults `submitLabel="Guardar"`, `pendingLabel="Guardando…"`. El caller deriva `defaultValues` del item.
   - `DeleteDialog` (ya existente) — el panel lo invoca directo, sin envoltorios por subentidad.
   - `FormField` / `InlineFormField` (`shared/ui/form-field.tsx`) — wrappers que centralizan label + asterisco de required (rojo, `text-destructive`) + description (xs, muted) + error (xs, destructive). `EntityForm` los usa por debajo; cualquier `FieldSlot` custom debe usarlos también en lugar de duplicar el `<Label>{label}{required?' *':''}</Label>` o el bloque de error.
   - Los modales se montan con state local del panel: `createOpen: boolean`, `editTarget: Entity | null`, `deleteTarget: Entity | null`.
4. **El `FormFieldDescriptor` admite dos props opcionales adicionales** para soportar tanto la edición inline como la presentación read-only:
   - `extra?: string | ((values: Partial<T>) => ReactNode)` — contenido que se renderiza debajo del control. Unifica los conceptos "hint estático" y "feedback dinámico":
     - **String** → se renderiza con el wrapper estilado (`text-xs text-muted-foreground`) en modal **e** inline. Ejemplo: `project-edit.form.ts` declara la advertencia de currency como `extra: 'Cambiar la moneda…'`.
     - **Función** → EntityForm la evalúa con todos los valores del form y renderiza el `ReactNode` resultante **sin envolver** (el caller controla el estilo). Solo aplica en modal — InlineField la ignora porque no tiene contexto de values. Ejemplo: `register-event.form.tsx` declara `extra: (values) => ...` para mostrar la transición de pipeline en vivo.
   - `badgeVariants?: Record<string, string | null | undefined>` — mapea cada valor de option al variant de `Badge` para mostrarlo coloreado en read-only del `InlineField`. Solo aplica a fields con `options`. El tipo está relajado a `string | null | undefined` para aceptar `BadgeProps['variant']` desde `shared/ui` sin cross-layer import.
5. **No** se crean carpetas dedicadas por subentidad (`budget-items/`, `expenses/`, etc.). El panel y los descriptores de form viven en sus ubicaciones normales (`features/<f>/components/<resource>-detail/` y `features/<f>/constants/`). El boilerplate de wrappers desaparece.
6. **El descriptor de form** es la única abstracción específica de la subentidad / entidad raíz. Cuando depende del contexto (ej. excluir IDs ya asignados), el descriptor se construye con una factory (`makeAssigneeCreateForm(excludeUserIds)`) y se memoiza con `useMemo` en el panel (el modal o el inline están montados siempre, así que sin memo se recrearía en cada render).
7. **El detail page del agregado no tiene `<h1>` con el nombre** ni botón "Editar" general. El nombre vive como `InlineField` en el panel de información — coherente con que cualquier escalar editable se edita en el panel donde se muestra, no en un modal global. Si una entidad requiere una acción de un solo click (cambio de estado, etc.), va como acción independiente en el header (como `StateChangeAction` en projects).

## Alternativas consideradas

- **Mantener los dos patrones** (cada feature elige). Descartado: no hay criterio objetivo y produjo la divergencia que motiva este ADR. La regla "modal para colecciones, inline para escalares" sí es objetiva.
- **Todo inline** (incluso colecciones multi-campo). Descartado: las filas inline con 3+ controles editables son mini-forms sin validación atómica; el cancel parcial y el manejo de error por fila se vuelven ad-hoc.
- **Todo modal** (incluso escalares como nombre). Descartado: penaliza la edición rápida campo-a-campo del agregado raíz, que es justamente lo que `contact-inline-field.tsx` resuelve bien.
- **Generar wrappers por subentidad con un codegen**. Descartado: el wrapper compartido (`EntityCreateModal`) ya elimina ~95% del boilerplate sin agregar una capa de generación.

## Consecuencias

**Positivas:**
- Una sola regla para decidir el patrón: ¿el dato es un atributo del agregado o un ítem de una colección?
- `EntityCreateModal` / `EntityEditModal` / `InlineField` centralizan toda la interacción de CRUD UI; agregar una entidad nueva es declarar su descriptor + componer en el panel.
- Se eliminaron 12 archivos boilerplate (~580 líneas) en `projects/components/project-detail/` y `edit-project-modal.tsx` (~90 líneas) ya no es necesario.
- Contacts y Projects ahora son consistentes en colecciones **y** en escalares.
- Asterisco de required, description y error se renderizan igual en toda la app (un solo lugar para cambiar estilos: `form-field.tsx`).
- `InlineField` derivó el label de display directamente de `field.options`, eliminando la necesidad de mantener un mapa paralelo `OPTION_LABEL_MAPS`.

**Negativas / trade-offs:**
- Promover un canal a "Principal" pasó de un click directo en un chip a abrir el modal de edición y togglear el switch. Se acepta por consistencia; si una colección concreta justifica una acción de un solo click, se puede agregar fuera del modal sin romper la convención (el modal sigue siendo el patrón para crear/editar el ítem completo).
- El delete dialog no muestra error de remoción en línea (antes algunas filas inline sí). Si una colección lo requiere, se puede agregar al `DeleteDialog` o al panel sin romper la convención.
- En project, el `<h1>` con el nombre del proyecto desapareció del header. La name pasó al primer `InlineField` del `ProjectInfoPanel`. Pérdida de jerarquía visual del título grande a cambio de coherencia con la convención y de tener el nombre editable in-place. Si el impacto visual molesta, se puede agregar un `<h1>` estático tipo "Proyecto" sin acoplarlo al value editable.

## Reglas concretas

- **Decisión de patrón**: si el dato es un atributo escalar del agregado raíz → `InlineField`. Si es un ítem de una colección de subentidades → modal con `EntityCreateModal` / `EntityEditModal` / `DeleteDialog`.
- **Ubicación**:
  - Wrappers compartidos: `app/ui/src/shared/ui/inline-field.tsx`, `entity-create-modal.tsx`, `entity-edit-modal.tsx`, `delete-dialog.tsx`, `form-field.tsx` (FormField + InlineFormField).
  - Tipos genéricos: `app/ui/src/shared/lib/form-view/types.ts` — `FormFieldDescriptor<T>`, `FieldDef<T>`, `toFieldDef<T>`.
  - Descriptores de form por entidad: `app/ui/src/features/<f>/constants/<resource>-<entity>.form.ts` (create) y `<resource>-<entity>-edit.form.ts` (edit).
  - Mappers de presentación (solo `makeValues` por entidad): `app/ui/src/features/<f>/components/<resource>-detail/<resource>-field-mappers.ts`.
  - Panel que orquesta: `app/ui/src/features/<f>/components/<resource>-detail/<resource>-<panel>-panel.tsx`.
- **State del panel para colecciones**: tres `useState` — `createOpen`, `editTarget`, `deleteTarget` — más handlers `handleAdd`, `handleEdit`, `handleDelete`.
- **Descriptor dinámico**: cuando depende del contexto del panel (excludeIds, etc.), construirlo con `useMemo` (clave estable derivada de los valores que afectan).
- **Mutation hook para escalares**: la mutation del agregado raíz (ej. `useUpdateProject`, `useUpdateContact`) **debe** aceptar el body type partial (`UpdateProjectBody`, `UpdateContactBody`), no el `ProjectEditFormValues` cerrado. El `InlineField` manda solo un campo por patch y el endpoint API ya acepta PATCH parcial.
- **`FieldSlot` custom**: solo cuando hace falta **reemplazar el control entero** (no decorarlo). Si lo único que querés es agregar contenido debajo del control que depende de los values del form, usá `extra: (values) => ReactNode` en el descriptor — no redeclares el Select/Input. El slot fue pensado para casos donde el widget default no alcanza.
- **Prohibido**:
  - Subcarpetas por subentidad con wrappers `create-*-modal.tsx` / `edit-*-modal.tsx`. El modal va directo en el panel.
  - Mantener mapas paralelos `OPTION_LABEL_MAPS` o equivalentes — el label se deriva de `field.options`.
  - Interpolar `' *'` en strings de label — el asterisco lo pone `FormField`/`InlineFormField` como `<span>` con color propio.
  - Botón "Editar" general en el header del detail page que abra un modal con el form completo del agregado.
  - Usar `FieldSlot` solo para agregar contenido debajo del control. Para eso está `extra: (values) => ReactNode` en el descriptor.
- **No mezclar** patrones para el mismo ítem: o es modal o es inline, no medio inline + modal.

## Ejemplos en el código

- `app/ui/src/shared/ui/inline-field.tsx` — InlineField genérico.
- `app/ui/src/shared/ui/entity-create-modal.tsx` — wrapper genérico (create).
- `app/ui/src/shared/ui/entity-edit-modal.tsx` — wrapper genérico (edit).
- `app/ui/src/shared/ui/form-field.tsx` — `FormField` y `InlineFormField` (label + asterisco rojo + description + error consistentes).
- `app/ui/src/shared/lib/form-view/types.ts` — `FormFieldDescriptor<T>`, `FieldDef<T>`, `toFieldDef<T>` (con `description` y `badgeVariants`).
- `app/ui/src/features/projects/components/project-detail/project-budget-items-panel.tsx` — panel de colección típico (modal).
- `app/ui/src/features/projects/components/project-detail/project-info-panel.tsx` — panel mixto: estado y fechas derivadas read-only + escalares editables (name, contactId, currency, startDate, description) vía `InlineField`.
- `app/ui/src/features/projects/constants/project-edit.form.ts` — uso de `extra` estática (string) en `currency`.
- `app/ui/src/features/contacts/components/contact-detail/contact-channels-panel.tsx` — colección con `isPrimary` togglable desde el modal.
- `app/ui/src/features/contacts/components/contact-detail/contact-data-panel.tsx` — escalares vía `InlineField` compartido.
- `app/ui/src/features/contacts/components/contact-detail/contact-address-panel.tsx` — idem.
- `app/ui/src/features/contacts/constants/contact-edit.form.ts` — uso de `badgeVariants` en `interestLevel` y `sourceChannel`.
- `app/ui/src/features/contacts/constants/register-event.form.tsx` — uso de `extra` función con cierre sobre contexto externo (`pipelineState`) vía factory `makeRegisterEventForm`. El modal `register-event-modal.tsx` ya no usa `FieldSlot`.
