# Dominio: `domain-logic` — Decisiones

Reglas de negocio del dominio del CRM: máquinas de estado, invariantes y políticas específicas de agregados (no convenciones técnicas transversales).

## EDRs en este dominio

| EDR | Status | Type | Consultá cuando... |
|---|---|---|---|
| [contact-state-machine.md](contact-state-machine.md) | Accepted | policy | Toques transiciones de estado en `contacts`, agregues/modifiques `EventType` o `PipelineState`, edites la política de transición del dominio, o registres eventos que puedan cambiar el estado del pipeline. |

**Leyenda de status:** `Accepted` · `Pending` · `Not Applicable` · `Deferred` · `Superseded`.
