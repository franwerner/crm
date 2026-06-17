# libphonenumber-js

- **Categoría:** Validación / Normalización de teléfonos
- **Versión:** latest / sin pinear
- **Status:** Accepted
- **Decidido en fase:** Fase 1 — Ingesta de contactos por Excel
- **Fecha:** 2026-06-17

## Por qué la elegimos

Validación y normalización de números de teléfono a formato E.164 en el checker de canales (`src/shared/verification/channel-checker.ts`). La normalización a E.164 es un requisito de la ingesta: garantiza que números con distintos formatos locales (`011-4555-1234`, `+54 11 4555-1234`, etc.) se almacenen de forma canónica y comparables para dedup.

- **Puro JS, sin dependencias nativas** — funciona en Bun sin bindings adicionales.
- Amplio soporte de formatos internacionales y regiones.
- Bien mantenida, ampliamente usada en producción.

## Uso concreto

- Importar desde `libphonenumber-js/min` (bundle mínimo — solo valida/parsea; excluye datos de formato de display que no necesitamos).
- Región default configurable vía `IMPORT_DEFAULT_PHONE_REGION` (env, default `'AR'`), validada con zod en `src/shared/config`.
- La región default se inyecta al checker por DI — el domain no lee el env.
- Resultado: número parseado y normalizado a E.164 (`+541145551234`), o resultado `invalid` si el número no puede parsearse en ninguna región conocida.

## Alternativas descartadas

- **`google-libphonenumber` (npm):** wrapper del binario Java de Google; más pesado, dependencia nativa, mayor complejidad de build. Descartado a favor del port JS puro.
- **Validación con regex propia:** inviable para números internacionales con sus variantes regionales de prefijos, longitudes y formatos. Descartado.

## Notas

- Consumidor principal: `DnsPhoneChannelChecker` en `src/shared/verification/channel-checker.ts`.
- El módulo `contacts` también consume el checker (vía `ContactAddChannelUseCase` / `ContactUpdateChannelUseCase`) — la normalización a E.164 aplica tanto en ingesta como en alta/edición manual de canales.
