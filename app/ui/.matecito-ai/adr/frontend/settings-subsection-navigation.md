# ADR — Navegación de sub-secciones de Configuración

- **Status:** Accepted
- **Fecha de creación:** 2026-06-17
- **Última actualización:** 2026-06-17
- **Decisores:** ifran
- **Fase:** settings-subsection-navigation

## Contexto

La Fase 3 sumó el CRUD de "Templates" de análisis, que conceptualmente es una sub-sección de **Configuración** (Settings), no una entidad de primer nivel del CRM como Contacts o Projects. Hasta ahora Settings era una única pantalla; Templates es la primera sub-sección que cuelga de ella, y se anticipan más (otras configuraciones del producto).

El `sidebar.tsx` (`src/app/shell/`) lista ítems de navegación de **nivel 1** y **hoy no soporta ítems expandibles/colapsables** (no hay submenú anidado). Hacía falta decidir dónde vive Templates y cómo se navega hacia él sin forzar al sidebar a un patrón que no tiene, y dejar un patrón reusable para las próximas sub-secciones de Config. El routing es code-based con factories por feature (`routing.md`).

## Decisión

Las sub-secciones de Configuración cuelgan como **ruta hija de Settings** (`/settings/<x>`) y se navega a ellas con **navegación interna dentro de la página de Settings**, no con un submenú expandible en el sidebar.

1. **Ruta hija bajo `/settings`.** Templates vive en `/settings/templates` (`features/settings/routes/settings.routes.ts` declara la ruta hija). El sidebar mantiene **un único** ítem de nivel 1 "Configuración" que apunta a `/settings`; no se agrega un ítem de nivel 1 por sub-sección ni un submenú colgando del ítem.
2. **Navegación interna en la page de Settings.** La pantalla de Settings ofrece la navegación entre sus sub-secciones (lista/tabs/links internos hacia `/settings/<x>`). El "índice" de Config vive **dentro** de Settings, no en el chrome global.
3. **El sidebar no gana ítems expandibles.** No se introduce el concepto de ítem colapsable/submenú en `sidebar.tsx` para esto. El sidebar sigue siendo una lista plana de destinos de nivel 1; las jerarquías de segundo nivel se resuelven con navegación interna de la sección padre.
4. **Patrón reusable.** Cualquier sub-sección futura de Configuración sigue el mismo molde: ruta hija `/settings/<x>` + entrada en la navegación interna de Settings. No se promueve a nivel 1 del sidebar salvo que deje de ser conceptualmente "configuración".

## Alternativas consideradas

- **Submenú expandible en el sidebar** (ítem "Configuración" que se despliega y muestra "Templates", etc.) — descartado: el `sidebar.tsx` no soporta ítems colapsables hoy; introducir el patrón (estado de abierto/cerrado, anidación, persistencia del expandido) es un cambio de chrome global para resolver lo que una page de sección puede resolver con navegación interna. Se evita inflar el sidebar.
- **Templates como ítem de nivel 1 en el sidebar** (al lado de Contacts/Projects) — descartado: Templates es configuración del producto, no una entidad operativa de primer nivel; ponerlo arriba mezcla niveles conceptuales y ensucia la navegación principal.
- **Templates como ruta de nivel raíz `/templates`** (fuera de `/settings`) — descartado: pierde la pertenencia a Configuración tanto en la URL como en la navegación; la sub-sección quedaría huérfana de su sección padre.

## Consecuencias

**Positivas:**
- El sidebar se mantiene plano y estable: una entrada "Configuración", sin lógica de expand/collapse.
- La jerarquía Config → sub-sección es explícita en la URL (`/settings/templates`) y en la navegación interna de Settings.
- Molde claro y repetible para las próximas sub-secciones de Config (agregar una ruta hija + un link interno).

**Negativas / trade-offs:**
- Las sub-secciones de Config no son alcanzables en un click desde el sidebar: hay que entrar a Settings y desde ahí navegar. Aceptable para configuración (acceso poco frecuente). Si una sub-sección se volviera de uso muy frecuente, se puede reevaluar promoverla.
- La navegación de segundo nivel queda repartida: el sidebar para nivel 1, la page de Settings para sus hijas. Es el costo de no meter expandibles en el sidebar.

## Reglas concretas

- **Sub-sección de Configuración:** ruta hija `/settings/<x>` declarada en `features/settings/routes/settings.routes.ts`; navegación hacia ella vía navegación interna de la page de Settings.
- **Sidebar:** una sola entrada de nivel 1 "Configuración" → `/settings`. Prohibido agregar un ítem de nivel 1 por sub-sección de Config, y prohibido introducir submenús expandibles en `sidebar.tsx` para resolver esto.
- **No** promover una sub-sección de Config a nivel raíz (`/<x>`) ni a nivel 1 del sidebar salvo que deje de ser conceptualmente configuración.
- Routing code-based con factory de feature, coherente con `routing.md`.

## Ejemplos en el código

- `app/ui/src/features/settings/routes/settings.routes.ts` — ruta `/settings` + hija `/settings/templates`.
- `app/ui/src/features/settings/views/settings-page.tsx` — page de Settings con la navegación interna hacia las sub-secciones.
- `app/ui/src/app/shell/sidebar.tsx` — ítem de nivel 1 "Configuración" (lista plana, sin expandibles).
