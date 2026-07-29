import nextVitals from 'eslint-config-next/core-web-vitals'
import { defineConfig, globalIgnores } from 'eslint/config'
import unusedImports from 'eslint-plugin-unused-imports'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      'unused-imports': unusedImports
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'react-hooks/set-state-in-effect': 'off',
      '@next/next/no-img-element': 'off'
    }
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts'])
])

export default eslintConfig
