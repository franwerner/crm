# Dominio: delivery — Índice

**Criterio de pertenencia:** ADRs sobre cómo se ensambla, configura y prueba el sistema: inyección de dependencias/composition root, carga y validación de configuración, y estrategia de testing.

| ADR | Status | Tema | Consultá cuando... |
|---|---|---|---|
| [dependency-injection.md](dependency-injection.md) | Accepted | DI | Conectes una dependencia, instancies un servicio, agregues un módulo a la composición. |
| [configuration.md](configuration.md) | Accepted | Configuración | Agregues una env var, leas configuración, valides config al startup. Hermano de `../security/secrets-management.md`. |
| [testing-strategy.md](testing-strategy.md) | **Pending** | Testing | Escribas un test, decidas si testear algo. **Leé la razón de aplazamiento — hay conflicto con Strict TDD Mode.** |

## No aplican (N/A)

Concerns que la matriz marca relevantes para `api-rest` pero sin ADR propio en esta etapa.

| Concern | Razón |
|---|---|
| arch-enforcement | Cubierto por `dependency-cruiser` (ver `../tech/dependency-cruiser.md`); sin ADR propio dedicado. |
| deployment-topology | Deploy aún no definido (greenfield, dev local); reconsiderar al ir a producción. |
| ci-quality-gates | Sin CI todavía. |
| documentation | Documentación de API cubierta por OpenAPI/Scalar (ver `../contracts/api-contract.md`); docs de proyecto informales por ahora. |
| feature-flags | Sin necesidad de flags en esta etapa. |
