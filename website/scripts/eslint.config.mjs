import { defineConfig } from 'eslint/config'
import RootConfig from '../../eslint.config.mjs'

export default defineConfig(
  ...RootConfig,
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
)
