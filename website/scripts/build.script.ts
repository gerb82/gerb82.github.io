import BuildSitemap from './core/build.pages.ts'
import mdx from '@mdx-js/esbuild'
import express from 'express'
import { sassPlugin } from 'esbuild-sass-plugin'
import ESBuild from 'esbuild'
import Engine_CorePlugin from './core/build.plugin.ts'
import { ChildProcess, spawn } from 'child_process'
import engineConfig from '../engine.config.ts'
import path from 'path'

const backendRenderer = (fileType: 'js' | 'tsx') => `backend-renderer.${fileType}`

const pageList = BuildSitemap(engineConfig)

let childProcess: ChildProcess | undefined = undefined

// TODO - use glob for initial file locating
// TODO - make sure this properly detects type errors in build
// Build backend
ESBuild.context({
  entryPoints: [`./scripts/templates/${backendRenderer('tsx')}`],
  outdir: './dist',
  plugins: [
    Engine_CorePlugin(
      {
        mode: 'BACKEND',
      },
      engineConfig,
      pageList,
    ),
    mdx({}),
    sassPlugin({
      embedded: true,
      type: 'local-css',
    }),
    ...(engineConfig.serveConfig
      ? [
          {
            name: 'ServeSSR',
            setup(build) {
              build.onStart(() => {
              // Notify rebuild started
              })
              build.onEnd((build) => {
                // Notify rebuild ended
                console.log('On Build End executed')

                const file = build.outputFiles!.find(file => file.path.endsWith(backendRenderer('js')))

                const buildServer = express()
                let buildServerInstance: ReturnType<ReturnType<typeof express>['listen']> | undefined = undefined

                buildServer.get(`/${backendRenderer('js')}`, (req, res) => {
                  res.send(file!.contents)
                  buildServerInstance?.close()
                })

                buildServerInstance = buildServer.listen(engineConfig.esbuild.backendWatchPort, () => {})

                if (childProcess) {
                  if (!childProcess.kill()) {
                    throw new Error('Failed to kill old server, executing order 66')
                  }
                }
                // TODO - convert this to a native node worker
                childProcess = spawn(
                  'node', [
                    '--import', './scripts/core/serve.hooks.mjs',
                    '--import', 'tsx/esm',
                    './scripts/serve.script.tsx',
                    `--port=${engineConfig.serveConfig?.port}`,
                    `--root-serve-path=siteroot://localhost:${engineConfig.esbuild.backendWatchPort}/${backendRenderer('js')}`,
                  ],
                  {
                    stdio: 'inherit',
                  },
                )
                // Node does not detect if a child process is running, but we want to make sure we don't try to kill a dead process
                childProcess.on('exit', () => {
                  childProcess = undefined
                })

                // if (engineConfig.mode === 'BUILD') {
                //   console.log(pageList)
                // }
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
    'process.env.NODE_ENV': `"${engineConfig.reactMode}"`,
  },
}).then(async (context) => {
  if (engineConfig.mode === 'BUILD') context.rebuild().then(() => {
    context.dispose()
    childProcess?.kill()
  })
  else if (engineConfig.mode === 'WATCH') context.watch()

  console.log('Backend esbuild running')
})

// Build frontend
ESBuild.context({
  entryPoints: ['./scripts/templates/frontend-renderer.tsx'],
  outfile: path.join(engineConfig.paths.outPath ?? './dist', 'renderer.js'),
  plugins: [
    Engine_CorePlugin(
      {
        mode: 'FRONTEND',
      },
      engineConfig,
      pageList,
    ),
    mdx({}),
    sassPlugin({
      embedded: true,
      type: 'local-css',
    }),
  ],
  bundle: true,
  write: engineConfig.mode === 'BUILD',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.ts': 'tsx' },
  define: {
    'process.env.NODE_ENV': `"${engineConfig.reactMode}"`,
  },
}).then(async (context) => {
  if (engineConfig.mode === 'BUILD') context.rebuild().then(() => context.dispose())
  else if (engineConfig.mode === 'WATCH') {
    context.serve({
      port: engineConfig.esbuild.frontendWatchPort ?? undefined,
    }).then((serve) => {
      context.watch()
      console.log(serve)
    })
  }

  console.log('Frontend esbuild running')
})
