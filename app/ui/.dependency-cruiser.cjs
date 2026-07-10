module.exports = {
  forbidden: [
    {
      name: 'adr02-1-features-isolated',
      severity: 'error',
      comment: 'EDR 02 #1: una feature no importa de otra feature. Lo común va a shared/, la composición a app/.',
      from: { path: '^src/features/([^/]+)/' },
      to: {
        path: '^src/features/([^/]+)/',
        pathNot: '^src/features/$1/',
      },
    },
    {
      name: 'adr02-2-shared-no-features',
      severity: 'error',
      comment: 'EDR 02 #2 y #6: el shared kernel (incluido shared/ui) no conoce features.',
      from: { path: '^src/shared/' },
      to: { path: '^src/features/' },
    },
    {
      name: 'adr02-3-5-api-not-in-shared-kernel',
      severity: 'error',
      comment: 'EDR 02 #3/#5 (rev. 2026-05-24): la salida de kubb (src/shared/api) es read-only. Las features pueden importarla para derivar tipos/schemas del contrato (descriptors, types, hooks, components). El kernel shared (lib/ui) no la importa; shared/api se importa a sí misma. Excepción acotada (rev. 2026-05-25): shared/lib/data-view/relations/ (resolvers de relación contract-aware) puede importar shared/api.',
      from: {
        path: '^src/',
        pathNot: [
          '^src/features/',
          '^src/app/',
          '^src/shared/api/',
          '^src/shared/lib/data-view/relations/',
        ],
      },
      to: { path: '^src/shared/api/' },
    },
    {
      name: 'adr02-6-shared-ui-pure',
      severity: 'error',
      comment: 'EDR 02 #6: shared/ui (design system) es presentacional puro: no importa la salida de kubb ni TanStack Query/Router ni kubb.',
      from: { path: ['^src/shared/ui/'] },
      to: {
        path: [
          '^src/shared/api/',
          'node_modules/(@tanstack/react-query|@tanstack/react-router|@kubb|kubb)/',
        ],
      },
    },
    {
      name: 'adr02-4-components-no-data-libs',
      severity: 'error',
      comment: 'EDR 02 #4 (rev. 2026-05-24): los componentes de feature no importan TanStack Query/Router ni kubb directo (reciben datos por props/hooks); sí pueden importar src/shared/api para tipos/schemas del contrato. Excepción por patrón: los componentes-contenedor (sufijos -tab.tsx, -tabs.tsx, -detail-header.tsx) orquestan hooks de datos o URL state — son containers, no presentacionales (ver folder-structure.md, sub-grupación de components/).',
      from: {
        path: ['^src/features/[^/]+/components/'],
        pathNot: [
          '-tab\\.tsx$',
          '-tabs\\.tsx$',
          '-detail-header\\.tsx$',
        ],
      },
      to: {
        path: [
          'node_modules/(@tanstack/react-query|@tanstack/react-router|@kubb|kubb)/',
        ],
      },
    },
    {
      name: 'adr02-7-only-app-composes-features',
      severity: 'error',
      comment: 'EDR 02 #7: solo src/app/** (composición) y src/main.tsx pueden importar componentes de ruta de features para armar el router. Las features no se importan entre sí (regla #1); shared tampoco (#2). Resultado: app/ es el único punto de composición cross-feature.',
      from: {
        path: '^src/',
        pathNot: ['^src/app/', '^src/main\\.tsx$', '^src/features/'],
      },
      to: { path: '^src/features/' },
    },
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Sin dependencias circulares.',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
  },
}
