import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import typescriptEslint from 'typescript-eslint'

const eslintConfig = defineConfig([
  js.configs.recommended,
  ...typescriptEslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    '.claude/**',
    '.expect/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
