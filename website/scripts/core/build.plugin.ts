import ESBuild from 'esbuild'
import Path from 'path'
import type { BuildConfigType } from '@SiteRoot'
import { readFileSync } from 'fs'

type Engine_CorePlugin_Config = {
  mode: 'BACKEND' | 'FRONTEND'
}

export default function Engine_CorePlugin(
  settings: Engine_CorePlugin_Config,
  config: BuildConfigType,
  pageList: [string, string][],
): ESBuild.Plugin {
  return {
    name: 'EngineCorePlugin',
    setup(context) {
      context.onResolve({ filter: /^@Pages/ }, (args) => {
        return {
          path: Path.resolve(config.paths.pagesPath, args.path.replace('@Pages/', '')),
        }
      })
      context.onResolve({ filter: /^@SiteRoot$/ }, () => {
        return {
        // Hack to get esbuild to see this as a real file, despite us never actually telling it to read it :D
          path: `${config.paths.siteRootTemplatePath}@SiteRoot`,
        }
      })
      // When we try to load the actual site root (note that we don't match for word start), intercept and fake it here
      context.onLoad({ filter: /@SiteRoot$/ }, () => {
      // Load the file
        const siteRootTemplate = readFileSync(config.paths.siteRootTemplatePath, 'utf-8')
        // Load page list
        // "Gracefully" "integrate" the page list into the site root template
        const template = siteRootTemplate
          .replaceAll(
            /@@Frontend{{(.*?)}}/gms,
            settings.mode === 'FRONTEND' ? '$1' : '',
          )
          .replaceAll(
            /@@Backend{{(.*?)}}/gms,
            settings.mode === 'BACKEND' ? '$1' : '',
          )
          .replaceAll(
            '@@REPLACER__IMPORTS',
            pageList.map(([, page], index) => `import Generated_Route${index} from '${page}'`).join('\n'),
          )
          .replaceAll(
            '@@REPLACER__PATHS',
            pageList.map(([relative], index) => `<Route path="${relative}" element={<Generated_Route${index} />} />`).join('\n'),
          )
          .replaceAll(
            '@@REPLACER__ALL_PAGES',
            pageList.map(([, page]) => `'${page}'`).join(','),
          )
          .replaceAll(
            '@@REPLACER_FRONTEND_RENDERER',
            // TODO - make sure build mode version works nicely with all serve formats, maybe add option for this path
            config.mode === 'WATCH' ? `http://localhost:${config.esbuild.frontendWatchPort}` : `./frontend-renderer.js`,
          )
          .replaceAll(
            '@@REPLACER_APP_ROOT_IMPORT',
            config.paths.appRootPath.replaceAll('\\', '\\\\'),
          )
          .replaceAll(
            /@@IsStrict{{(.*?)}}/gms,
            config.reactMode === 'development' ? '$1' : '',
          )

        // console.log(template)
        return {
          contents: template,
          loader: 'tsx',
        }
      })
    },
  }
}
