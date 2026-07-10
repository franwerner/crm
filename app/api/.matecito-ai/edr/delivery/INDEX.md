# Dominio: `delivery` — Decisiones

Cómo se ensambla, configura y prueba el sistema: inyección de dependencias/composition root, carga y validación de configuración, y estrategia de testing.

## EDRs en este dominio

| EDR | Status | Type | Consultá cuando... |
|---|---|---|---|
| [dependency-injection.md](dependency-injection.md) | Accepted | decision | Conectes una dependencia, instancies un servicio, agregues un módulo a la composición. |
| [configuration.md](configuration.md) | Accepted | convention | Agregues una env var, leas configuración, valides config al startup. Hermano de `../security/secrets-management.md`. |
| [testing-strategy.md](testing-strategy.md) | Pending | decision | Escribas un test, decidas si testear algo. **Leé la razón de aplazamiento — hay conflicto (resuelto) con Strict TDD Mode.** |

## No aplican en este dominio

Concerns que la matriz marca relevantes para `api-rest` pero sin EDR propio en esta etapa.

| Concern | Razón |
|---|---|
| arch-enforcement | Cubierto por `dependency-cruiser` (ver `../tech/dependency-cruiser.md`); sin EDR propio dedicado. |
| deployment-topology | Deploy aún no definido (greenfield, dev local); reconsiderar al ir a producción. |
| ci-quality-gates | Sin CI todavía. |
| documentation | Documentación de API cubierta por OpenAPI/Scalar (ver `../contracts/api-contract.md`); docs de proyecto informales por ahora. |
| feature-flags | Sin necesidad de flags en esta etapa. |

**Leyenda de status:** `Accepted` · `Pending` · `Not Applicable` · `Deferred` · `Superseded`.
