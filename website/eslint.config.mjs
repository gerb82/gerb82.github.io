import { defineConfig } from 'eslint/config'
import RootConfig from '../eslint.config.mjs'
import globals from 'globals'

export default defineConfig(
  ...RootConfig,
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'], languageOptions: { globals: globals.browser } },
)
