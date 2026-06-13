# ADR — Estructura de carpetas y naming (app/ui)

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-06-13
- **Decisores:** ifran
- **Fase:** folder-structure

## Contexto

La estructura macro quedó en el `layers-and-dependencies.md` (features/ + shared/ + app/). Este ADR define el naming de archivos y cómo se organiza el design-system dentro de `shared/ui`.

Originalmente se adoptó Atomic Design (atoms/molecules/organisms) en `shared/ui` y PascalCase para archivos de componente. Ambas decisiones se revierten (2026-05-23) al integrar Tailwind v4 + shadcn/ui (`../frontend/styling-and-design-system.md`): shadcn genera una carpeta `ui/` plana con archivos kebab-case, y el código ya existente (`src/app/error-boundary.tsx`) usaba kebab. Se prioriza consistencia con shadcn y con `app/api` (kebab en todo el monorepo).

## Decisión

| Qué | Convención |
|---|---|
| Nombres de archivo (todos) | `kebab-case` (`data-table.tsx`, `use-customers.ts`, `query-client.ts`) |
| Identificadores en código | componentes y tipos `PascalCase` · funciones/vars `camelCase` · constantes `UPPER_SNAKE_CASE` |
| Hooks | archivo `use-<nombre>.ts` (kebab con prefijo `use`); función `use<Nombre>` |
| Carpetas de feature | `features/<feature>/` (nombre del feature en minúscula) |
| `shared/ui` (design system) | **carpeta plana**, sin taxonomía atómica |
| Templates / pages | NO van en `shared/ui` — viven en `features/<f>/views/` |
| Definiciones de ruta | en `features/<f>/routes/` como factories (función `create<F>Routes(parentRoute)` que devuelve los `createRoute` del feature) |
| Componentes de negocio | en `features/<f>/components/`, NUNCA en `shared/ui` |

> El nombre de archivo es kebab, pero el identificador del componente React sigue siendo PascalCase por restricción de JSX (`data-table.tsx` → `export function DataTable()`).

## Reglas concretas

- `shared/ui` contiene SOLO componentes **agnósticos de dominio** (Button, Input, Modal, DataTable genérica). Si un componente "sabe" qué es un customer/deal, es de feature → `features/`.
- `shared/ui` es plano: no se sub-clasifica en atoms/molecules/organisms. Los componentes base genéricos (shadcn + propios reutilizables) conviven en la misma carpeta.
- Un componente nuevo: ¿es agnóstico y reutilizable? → `shared/ui`. ¿Sabe de dominio o solo lo usa un feature? → `features/<f>/components/`.
- Hooks de feature en `features/<f>/hooks/` con archivo `use-*.ts`.
- Componentes de shadcn: se generan con su CLI en `shared/ui` y conservan el kebab-case que es la convención del paquete (ver `../frontend/styling-and-design-system.md`).

## Sub-grupación dentro de `components/` cuando un slice de UI crece (pilot: projects)

**Trigger**: aplicar cuando `features/<f>/components/` (o un sub-set como `<entidad>-detail/`) supera ~aprox. 8-10 componentes con sub-conceptos claramente separables (p.ej. agrupados por tab/sección de una pantalla). NO se crea otro feature ni se mueve nada a `shared/ui`: sigue siendo un feature, componentes presentacionales/contenedores de feature.

**Convención**: dentro de `components/<screen>/`, agrupar por sub-sección en sub-carpetas (`summary/`, `finance/`, `people/`, `documents/`, `activity/`). Cada sub-carpeta contiene su contenedor `project-<grupo>-tab.tsx` (orquesta hooks de datos del grupo) y los panels presentacionales de ese grupo. El chrome compartido (header, summary-bar, declaración única de tabs, acciones del header) queda en la raíz de `components/<screen>/`.

**Patrón container/presentational**: el contenedor de sub-sección posee los hooks de kubb/Query/mutación de su grupo (regla 4 de `layers-and-dependencies.md`); los panels siguen siendo props-only. La vista raíz solo compone chrome + el orquestador de tabs y posee únicamente la query base del agregado.

**Naming**: carpeta de sub-sección en singular inglés (`summary/`, `finance/`); contenedor `project-<grupo>-tab.tsx`; archivos kebab-case, identificador PascalCase (regla general de naming). Sin sufijo especial nuevo (no hay equivalente UI a `.repo-part.ts`).

**dependency-cruiser**: la regla `adr02-4-components-no-data-libs` prohíbe que los componentes de feature importen TanStack Query/Router o kubb. Los contenedores de sub-sección la violarían legítimamente (poseen los hooks de datos, regla 4). Se exceptúan **por patrón de naming**, no por lista de archivos: `pathNot` cubre los sufijos `-tab.tsx` (contenedores de grupo), `-tabs.tsx` (orquestador de tabs) y `-detail-header.tsx` (chrome de header). Los panels presentacionales (sin esos sufijos) siguen bajo la regla. Así cada container nuevo queda cubierto sin tocar la config.

**Generaliza**: contacts u otras pantallas-detalle aplican la misma convención al alcanzar el trigger; sus contenedores caen en el patrón de excepción automáticamente.

## Alternativas consideradas

- PascalCase para archivos de componente (convención idiomática React) — **descartado** (era la decisión original): generaba naming mixto con shadcn (kebab) y con el resto del paquete; se unifica a kebab.
- `shared/ui` con Atomic Design (atoms/molecules/organisms) — **descartado** (era la decisión original): sobre-estructura para el tamaño del design-system y choca con la carpeta plana de shadcn; la frontera molecule/organism es difusa y no aporta valor enforced.

## Consecuencias

**Positivas:** un solo estilo de naming en todo el monorepo (kebab); cero fricción con el CLI de shadcn; `shared/ui` simple.

**Negativas / trade-offs:** se pierde la gradación del design-system (mitigado: el corte real shared-vs-feature lo enforza dependency-cruiser, `layers-and-dependencies.md`); el naming de archivo kebab + identificador PascalCase requiere recordar la distinción.
