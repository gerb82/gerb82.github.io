import express from 'express'
import { renderToString } from 'react-dom/server'
import type SiteRoot from '@SiteRoot'
// Note that this file doesn't build with esbuild, hence it is required that we still import react manually here!
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react'
import Arg from 'arg'

const parsedArgs = Arg({
  '--root-serve-path': String,
  '--public-serve-path': String,
  '--pure-serve': Boolean,
  '--port': Number,
})

if (!parsedArgs['--root-serve-path']) throw Error(`Please pass a valid --root-serve-path`)
if (!parsedArgs['--port']) throw Error(`Please pick a valid --port`)

async function createServer() {
  const PORT = parsedArgs['--port']
  const app = express()

  if (parsedArgs['--pure-serve']) {
    // TODO - check if we need to potentially tell this to automatically resolve no suffix requests as .html
    app.use(express.static(parsedArgs['--root-serve-path']!, { maxAge: '7d' }))
  }
  else {
    const { RenderSite, PageList } = await import(parsedArgs['--root-serve-path']!) as typeof SiteRoot

    app.get('/.page-list', (req, res) => {
      res.send(renderToString(
        <ul>
          {PageList.map(path => <li key={path}>{path}</li>)}
        </ul>,
      ))
    })

    app.get('/{*splat}', async (req, res) => {
      // reject any request with a file extension to let another path handle them
      if (req.path.match(/\.[a-z]+$/)) return
      res.send(
        renderToString(<RenderSite location={req.path} />), // .replace('head>', `head> <script src="${parsedArgs['--frontend-renderer-path']}"> </script>`),
      )
    })

    if (parsedArgs['--public-serve-path']) app.use(express.static(parsedArgs['--public-serve-path'], { maxAge: '7d' }))
  }

  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
  })
}

createServer()
