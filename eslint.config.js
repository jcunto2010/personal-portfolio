import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  // Ignore build output and deps
  { ignores: ['dist', 'node_modules'] },

  // Base JS recommended
  js.configs.recommended,

  // TypeScript recommended (type-checked rules applied to .ts/.tsx)
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // React Hooks
      ...reactHooks.configs.recommended.rules,

      // React Refresh (fast-refresh boundaries)
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Security: block eval and equivalent
      'no-eval': 'error',
      'no-new-func': 'error',

      // Console: warn on console.log/warn/info, allow console.error
      'no-console': ['warn', { allow: ['error'] }],

      // TypeScript strictness
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
    },
  },

  // Relax some rules for config files at the root (JS, not TS)
  {
    files: ['*.config.{js,ts}', 'postcss.config.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
)
