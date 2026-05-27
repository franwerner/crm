# eslint-plugin-boundaries

- **Categoría:** Enforcement de arquitectura (DX en editor)
- **Versión:** latest / sin pinear (greenfield — pinear como devDependency al scaffoldear)
- **Status:** Accepted
- **Decidido en fase:** layers-and-dependencies (enforcement, decisión post-bootstrap)
- **Fecha:** 2026-05-17

## Por qué la elegimos

Da feedback **inmediato en el editor** cuando un import viola las reglas del `layers-and-dependencies.md` (no esperás al CI). Capa de DX encima de dependency-cruiser, que sigue siendo el gate autoritativo en CI.

## Alternativas descartadas

- **Solo dependency-cruiser:** suficiente para el gate, pero sin marcar el error mientras escribís; boundaries cierra ese loop de feedback.

## Notas

- Solo en `app/ui` (atado al setup de ESLint del front). `app/api` usa solo dependency-cruiser.
- Mapea las reglas del `layers-and-dependencies.md` a "tipos de elemento" (features, shared/ui, shared/api, app). Mantener sincronizado con el `layers-and-dependencies.md` y con la config de dependency-cruiser.
- NO reemplaza el gate de CI: si boundaries y dependency-cruiser difieren, dependency-cruiser manda.
