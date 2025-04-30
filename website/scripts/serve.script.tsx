import express from 'express'
import { renderToString } from 'react-dom/server'
import type SiteRoot from '@SiteRoot'
// Note that this file doesn't build with esbuild, hence it is required that we still import react manually here!
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react'
import Arg from 'arg'

const parsedArgs = Arg({
  '--serve-path': String,
  '--additional-serve-path': String,
  '--pure-serve': Boolean,
  '--port': Number,
})

if (!parsedArgs['--serve-path']) throw Error(`Please pass a valid --serve-path`)
if (!parsedArgs['--port']) throw Error(`Please pick a valid --port`)

async function createServer() {
  const PORT = parsedArgs['--port']
  const app = express()

  if (parsedArgs['--pure-serve']) {
    app.use(express.static(parsedArgs['--serve-path']!, { maxAge: '7d' }))
  }
  else {
    console.log('Begin importing backend renderer')
    const { RenderSite, PageList } = await import(parsedArgs['--serve-path']!) as typeof SiteRoot
    console.log('Backend renderer imported')

    app.get('/.page-list', (req, res) => {
      res.send(renderToString(
        <ul>
          {PageList.map(path => <li key={path}>{path}</li>)}
        </ul>,
      ))
    })

    app.get('/{*splat}', (req, res) => {
      res.send(
        renderToString(<RenderSite location={req.path} />), // .replace('head>', `head> <script src="${parsedArgs['--frontend-renderer-path']}"> </script>`),
      )
    })

    if (parsedArgs['--additional-serve-path']) app.use(express.static(parsedArgs['--additional-serve-path'], { maxAge: '7d' }))
  }

  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
  })
}

createServer()
