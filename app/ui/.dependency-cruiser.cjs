module.exports = {
  forbidden: [
    {
      name: 'adr02-1-features-isolated',
      severity: 'error',
      comment: 'ADR 02 #1: una feature no importa de otra feature. Lo común va a shared/, la composición a app/.',
      from: { path: '^src/features/([^/]+)/' },
      to: {
        path: '^src/features/([^/]+)/',
        pathNot: '^src/features/$1/',
      },
    },
    {
      name: 'adr02-2-shared-no-features',
      severity: 'error',
      comment: 'ADR 02 #2 y #6: el shared kernel (incluido shared/ui) no conoce features.',
      from: { path: '^src/shared/' },
      to: { path: '^src/features/' },
    },
    {
      name: 'adr02-3-5-api-only-in-feature-hooks',
      severity: 'error',
      comment: 'ADR 02 #3 y #5: la salida de kubb (src/shared/api) es read-only y solo la consumen los hooks de feature (src/features/*/hooks). app/ puede tocarla para configurar el cliente/providers; shared/api se importa a sí misma.',
      from: {
        path: '^src/',
        pathNot: [
          '^src/features/[^/]+/hooks/',
          '^src/app/',
          '^src/shared/api/',
        ],
      },
      to: { path: '^src/shared/api/' },
    },
    {
      name: 'adr02-4-6-presentational-pure',
      severity: 'error',
      comment: 'ADR 02 #4 y #6: los presentacionales (features/*/components y shared/ui) reciben datos por props; no importan la salida de kubb ni TanStack Query/Router ni kubb.',
      from: { path: ['^src/features/[^/]+/components/', '^src/shared/ui/'] },
      to: {
        path: [
          '^src/shared/api/',
          'node_modules/(@tanstack/react-query|@tanstack/react-router|@kubb|kubb)/',
        ],
      },
    },
    {
      name: 'adr02-7-only-app-composes-features',
      severity: 'error',
      comment: 'ADR 02 #7: solo src/app/** (composición) y src/main.tsx pueden importar componentes de ruta de features para armar el router. Las features no se importan entre sí (regla #1); shared tampoco (#2). Resultado: app/ es el único punto de composición cross-feature.',
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
