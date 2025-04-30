import { fileURLToPath } from 'url'
import Path from 'path'
import Arg from 'arg'
import { BuildConfigType } from '@SiteRoot'

export const basePath = Path.dirname(fileURLToPath(import.meta.url))

const commonPaths: BuildConfigType['paths'] = {
  outPath: Path.resolve(basePath, './dist'),
  assetsPath: Path.resolve(basePath, './public'),
  pagesPath: Path.resolve(basePath, './pages'),
  appRootPath: Path.resolve(basePath, './src/App.tsx'),
  siteRootTemplatePath: Path.resolve(basePath, './scripts/templates/site-router.template'),
}

const SITE_CONFIG = {
  START: {
    reactMode: 'development',
    mode: 'WATCH',
    paths: {
      ...commonPaths,
      outPath: null,
    },
    esbuild: {
      frontendWatchPort: 4443,
      backendWatchPort: 4444,
    },
    serveConfig: {
      port: 6006,
    },
  },
  BUILD: {
    reactMode: 'production',
    mode: 'BUILD',
    paths: {
      ...commonPaths,
    },
    esbuild: {
      frontendWatchPort: null,
      backendWatchPort: 4444,
    },
    serveConfig: undefined,
  },
} as const satisfies {
  [Key in string]: BuildConfigType
}

const parsedArgs = Arg({
  '--script': String,
})

if (!Object.keys(SITE_CONFIG).includes(parsedArgs['--script'] ?? '')) throw Error(`Please pick a valid run script! (--script cannot be set to ${parsedArgs['--script']})`)

export default SITE_CONFIG[parsedArgs['--script'] as keyof typeof SITE_CONFIG]
