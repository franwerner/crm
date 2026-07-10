# Dominio: delivery — Índice

**Criterio de pertenencia:** EDRs sobre el ensamblado, la configuración por entorno y la prueba del paquete: carga/validación de config (`VITE_*`) y estrategia de testing.

| EDR | Status | Tema | Consultá cuando... |
|---|---|---|---|
| [configuration.md](configuration.md) | Accepted | Configuración | Agregues una `VITE_` env var, leas config, manejes URL del API por entorno. |
| [testing-strategy.md](testing-strategy.md) | Pending | Testing | Escribas un test. **Leé la razón — conflicto con Strict TDD Mode.** |

## No aplican (N/A)

Concerns que la matriz marca relevantes para `web-spa` pero sin EDR propio en esta etapa.

| Concern | Razón |
|---|---|
| dependency-injection | N/A: composición de React (props/hooks/context); sin contenedor IoC. Lo más cercano a un composition root es `src/app/` (providers + router + guards). |
| arch-enforcement | Cubierto por `eslint-plugin-boundaries` + `dependency-cruiser` (ver `../tech/eslint-plugin-boundaries.md`, `../tech/dependency-cruiser.md`); sin EDR propio dedicado. |
| deployment-topology | Build estático servido por contenedor; topología de deploy no formalizada todavía. |
| ci-quality-gates | Sin CI todavía. |
| documentation | Docs informales por ahora. |
| feature-flags | Sin necesidad de flags en esta etapa. |
