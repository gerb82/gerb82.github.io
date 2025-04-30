import BuildSitemap from './core/build.pages.ts'
import mdx from '@mdx-js/esbuild'
import ESBuild from 'esbuild'
import Engine_CorePlugin from './core/build.plugin.ts'
import { ChildProcess, spawn } from 'child_process'
import EngineConfig from '../engine.config.ts'
import engineConfig from '../engine.config.ts'

const pageList = BuildSitemap(EngineConfig)

let childProcess: ChildProcess | undefined = undefined
let ignoreNext = false

// Build backend
ESBuild.context({
  entryPoints: ['./scripts/templates/backend-renderer.tsx'],
  outdir: EngineConfig.paths.outPath ?? './dist',
  plugins: [
    Engine_CorePlugin(
      {
        mode: 'BACKEND',
      },
      EngineConfig,
      pageList,
    ),
    mdx({}),
    ...(engineConfig.serveConfig
      ? [
          {
            name: 'ServeSSR',
            setup(build) {
              build.onStart(() => {
              // Notify rebuild started
              })
              build.onEnd(() => {
                // Notify rebuild ended
                console.log('On Build End executed')

                if (!ignoreNext) {
                  if (childProcess) {
                    if (!childProcess.kill()) {
                      throw new Error('Failed to kill old server, executing order 66')
                    }
                  }
                  childProcess = spawn('node', [
                    '--import', './scripts/core/serve.hooks.mjs',
                    '--import', 'tsx/esm',
                    './scripts/serve.script.tsx',
                    `--port=${engineConfig.serveConfig?.port}`,
                    `--serve-path=siteroot://localhost:${engineConfig.esbuild.backendWatchPort}/backend-renderer.js`,
                  ],
                  {
                    stdio: 'inherit',
                  },
                  )
                  // Node does not detect if a child process is running, but we want to make sure we don't try to kill a dead process
                  childProcess.on('exit', () => {
                    childProcess = undefined
                  })
                  ignoreNext = true
                }
                else ignoreNext = false
              })
            },
          } as ESBuild.Plugin]
      : []),
  ],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
  jsx: 'automatic',
  loader: { '.ts': 'tsx' },
  packages: 'external',
  define: {
    'process.env.NODE_ENV': `"${EngineConfig.reactMode}"`,
  },
}).then(async (context) => {
  await context.serve({
    port: EngineConfig.esbuild.backendWatchPort,
  }).then((serve) => {
    console.log(serve)
  })

  // TODO - maybe make custom watch logic to detect critical changes, and JUST restart the dev server - esbuild will rebuild
  context.watch()
  console.log('Backend esbuild running')
})

// Build frontend
ESBuild.context({
  entryPoints: ['./scripts/templates/frontend-renderer.tsx'],
  outdir: EngineConfig.paths.outPath ?? './dist',
  plugins: [Engine_CorePlugin({
    mode: 'FRONTEND',
  }, EngineConfig, pageList), mdx({})],
  bundle: true,
  write: EngineConfig.mode === 'BUILD',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.ts': 'tsx' },
  define: {
    'process.env.NODE_ENV': `"${EngineConfig.reactMode}"`,
  },
}).then(async (context) => {
  await context.serve({
    port: EngineConfig.esbuild.frontendWatchPort ?? undefined,
  }).then((serve) => {
    console.log(serve)
  })
  context.watch()
  console.log('Frontend esbuild running')
})
