# dependency-cruiser

- **Categoría:** Enforcement de arquitectura (CI gate)
- **Versión:** latest / sin pinear (greenfield — pinear como devDependency al scaffoldear)
- **Status:** Accepted
- **Decidido en fase:** layers-and-dependencies (enforcement, decisión post-bootstrap)
- **Fecha:** 2026-05-17

## Por qué la elegimos

Backbone de enforcement de las 7 reglas del `../structure/layers-and-dependencies.md`, expresadas como globs de path. Corre en CI y **falla el pipeline** ante un import que viole las reglas. Mismo tooling que `app/api` → consistencia de enforcement en todo el monorepo.

## Alternativas descartadas

- **Solo eslint-plugin-boundaries:** da DX en editor pero no se eligió como único — se usa además (ver `eslint-plugin-boundaries.md`) para feedback inmediato, con dependency-cruiser como gate de CI autoritativo.
- **Nada / revisión manual:** las reglas serían un deseo.

## Notas

- `.dependency-cruiser.js` traduce las 7 reglas del `../structure/layers-and-dependencies.md` (features aisladas, shared no conoce features, shared/api read-only, presentacionales sin kubb/Query, etc.).
- **Crítico:** gate de CI obligatorio. Sin eso, no cumple el objetivo.
- Convive con `eslint-plugin-boundaries`: boundaries = feedback en editor; dependency-cruiser = verdad en CI.
