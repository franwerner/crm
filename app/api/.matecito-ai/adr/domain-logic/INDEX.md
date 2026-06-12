# Dominio: domain-logic — Índice

**Criterio de pertenencia:** ADRs sobre reglas de negocio del dominio del CRM: máquinas de estado, invariantes y políticas específicas de agregados (no convenciones técnicas transversales).

| ADR | Status | Tema | Consultá cuando... |
|---|---|---|---|
| [contact-state-machine.md](contact-state-machine.md) | Accepted | Máquina de estados del pipeline de Contact (event-only) | Toques transiciones de estado en `contacts`, agregues/modifiques `EventType` o `PipelineState`, edites `domain/policies.ts`, `Contact.registerEvent`, o cualquier punto que mencionaba `stateLocked` / `changeStateManually`. |
