import { PropsWithChildren } from 'react'

export default function App({ children }: PropsWithChildren) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* <link rel="stylesheet" href="/styles.css"></link> */}
        <title>My app</title>
      </head>
      <body>
        Hello
        {children}
      </body>
    </html>
  )
}
