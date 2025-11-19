import { PropsWithChildren } from 'react'
import Scss from './App.module.scss'
import TestComponent from './test-component/test-component'

export default function App({ children }: PropsWithChildren) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>My app</title>
      </head>
      <body>
        Hello
        <TestComponent />
        <div className={Scss['test']}>HELP ME</div>
        {children}
      </body>
    </html>
  )
}
