# Zod

- **Categoría:** Validación (config + forms)
- **Versión:** latest / sin pinear (greenfield — pinear con caret al inicializar)
- **Status:** Accepted
- **Decidido en fase:** inter-layer-communication / configuration
- **Fecha:** 2026-05-17

## Por qué la elegimos

Dos usos: (1) validar `import.meta.env` en el módulo de config al startup (`../delivery/configuration.md`), fallar rápido si falta una var; (2) validar formularios — los schemas los genera `@kubb/plugin-zod` desde el OpenAPI de `app/api`, conectados a react-hook-form vía `@hookform/resolvers`.

## Alternativas descartadas

- **Validación a mano / sin runtime check:** un `.env` mal seteado rompe sin mensaje claro; los schemas de form se desincronizan del backend.

## Notas

- Los schemas zod de **formularios** NO se escriben a mano: los genera kubb (artefacto, read-only). Ver `kubb.md` y `react-hook-form.md`.
- El schema zod de **config** sí se escribe a mano (es local al front, no viene del API).
- Mismo principio que `app/api` `configuration.md` (fallar rápido y claro al startup), decisión autónoma de este paquete.
