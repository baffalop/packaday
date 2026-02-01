import neostandard from 'neostandard'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  ...neostandard(),
  ...tseslint.configs.recommended,
  {
    ignores: [
      '_build/**',
      '_opam/**',
      'node_modules/**',
      'dist/**',
      'src/**/*.js',
      'playwright/.cache/**',
      '__snapshots__/**',
      'test-results/**',
      'playwright-report/**',
      '.patches/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
)
