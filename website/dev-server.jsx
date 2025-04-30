// import path from 'path'

// import React from 'react'
import ReactDOMServer from 'react-dom/server'
import express from 'express'

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3000
const app = express()

app.get('/', (req, res) => {
  res.send(ReactDOMServer.renderToString())
})

// app.use(
//   // eslint-disable-next-line no-undef
//   express.static(path.resolve(__dirname, '.', 'dist'), { maxAge: '30d' }),
// )

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
