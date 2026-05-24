import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import boundaries from 'eslint-plugin-boundaries'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['dist', 'src/shared/api/**', '.dependency-cruiser.cjs'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      boundaries,
    },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app', mode: 'folder' },
        { type: 'main', pattern: 'src/main.tsx', mode: 'file' },
        { type: 'feature-components', pattern: 'src/features/*/components', mode: 'folder', capture: ['feature'] },
        { type: 'feature-hooks', pattern: 'src/features/*/hooks', mode: 'folder', capture: ['feature'] },
        { type: 'feature-routes', pattern: 'src/features/*/routes', mode: 'folder', capture: ['feature'] },
        { type: 'feature-types', pattern: 'src/features/*/*.types.ts', mode: 'file', capture: ['feature'] },
        { type: 'shared-ui', pattern: 'src/shared/ui', mode: 'folder' },
        { type: 'shared-lib', pattern: 'src/shared/lib', mode: 'folder' },
        { type: 'shared-api', pattern: 'src/shared/api', mode: 'folder' },
      ],
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      'boundaries/no-unknown': 'off',
      'boundaries/no-unknown-files': 'off',
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          message: '${file.type} no puede importar ${dependency.type} (ADR 02).',
          rules: [
            {
              from: ['app'],
              allow: [
                'app', 'main', 'feature-components', 'feature-hooks',
                'feature-routes', 'feature-types', 'shared-ui', 'shared-lib', 'shared-api',
              ],
            },
            { from: ['main'], allow: ['app', 'shared-lib', 'shared-ui'] },
            {
              from: ['feature-routes'],
              allow: [
                'shared-ui', 'shared-lib',
                ['feature-components', { feature: '${from.feature}' }],
                ['feature-hooks', { feature: '${from.feature}' }],
                ['feature-types', { feature: '${from.feature}' }],
                ['feature-routes', { feature: '${from.feature}' }],
              ],
            },
            {
              from: ['feature-hooks'],
              allow: [
                'shared-lib', 'shared-api',
                ['feature-hooks', { feature: '${from.feature}' }],
                ['feature-types', { feature: '${from.feature}' }],
              ],
            },
            {
              from: ['feature-components'],
              allow: [
                'shared-ui', 'shared-lib',
                ['feature-components', { feature: '${from.feature}' }],
                ['feature-types', { feature: '${from.feature}' }],
              ],
            },
            {
              from: ['feature-types'],
              allow: ['shared-lib', ['feature-types', { feature: '${from.feature}' }]],
            },
            { from: ['shared-ui'], allow: ['shared-ui', 'shared-lib'] },
            { from: ['shared-lib'], allow: ['shared-lib'] },
            { from: ['shared-api'], allow: ['shared-api', 'shared-lib'] },
          ],
        },
      ],
      'boundaries/external': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: ['shared-ui', 'feature-components'],
              disallow: ['@tanstack/react-query', '@tanstack/react-router', 'kubb', '@kubb/*'],
              message: 'Presentacional no importa libs de datos/routing (ADR 02 #4/#6).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
)
