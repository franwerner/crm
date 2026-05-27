# Zod

- **Categoría:** Validación (borde / input DTO)
- **Versión:** latest / sin pinear (greenfield — pinear con caret al inicializar, ej. `^3.x`)
- **Status:** Accepted
- **Decidido en fase:** inter-layer-communication
- **Fecha:** 2026-05-17

## Por qué la elegimos

Validación de forma y tipos del input crudo en el borde HTTP, con inferencia de tipos TypeScript (un solo schema = validación runtime + tipo estático del input DTO). Integra con Hono vía `@hono/zod-validator`. Cubre la capa perimetral de la decisión "validación en ambos lados" (ver `inter-layer-communication.md`); las invariantes de negocio NO van en zod sino en el dominio.

## Alternativas descartadas

- **Valibot:** API similar y más liviano, pero zod tiene más tracción/ecosistema y adapter oficial de Hono. Reconsiderable si el bundle size importa en target edge.
- **TypeBox / AJV:** JSON-Schema-first; más verboso para DX en TS que la inferencia de zod.
- **Validación manual:** descartada — no escala y duplica el tipo + el check.

## Notas

- Usar `@hono/zod-validator` para enganchar el schema en el handler Hono (borde del slice).
- **Límite de responsabilidad:** zod valida forma/tipos (¿es string?, ¿vino el campo?). Las reglas de negocio (formato de Email, amount no negativo, invariantes de entidad) viven en el dominio del slice, NO en el schema zod. No mezclar.
- El schema de entrada produce el input DTO tipado que consume el use-case (ver `inter-layer-communication.md` §3.1: entrada DTO, salida view-model).
