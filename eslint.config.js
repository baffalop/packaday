import neostandard from 'neostandard'

export default [
  ...neostandard(),
  {
    ignores: ['_build/**', '_opam/**', 'node_modules/**', 'dist/**'],
  },
  {
    rules: {
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
    },
  },
]
