declare module '@SiteRoot' {
  import type { FC } from 'react'

  const PageList: string[]

  const RenderSite: FC<{ location?: string }>

  const BuildConfig: BuildConfigType

  type BuildConfigType = {
    // --------- General ---------

    /** [GLOBAL] React mode - production or development (development also enables strict mode) */
    reactMode: 'development' | 'production'

    /**
     * [GLOBAL] What build mode to use
     * - `WATCH` - Serve all files via webservers, dynamically updating the whole system
     * - 'BUILD' - Load all files once, write the files required for static hosting into `outPath`, and close
     *
     * \* Note that this should rarely if ever affect the actual code's behavior,
     * since a ~~PAINFUL~~ amount of effort was put into making all the modes act the same
     */
    mode: 'WATCH' | 'BUILD'

    // --------- Paths ---------
    paths: {
      /** [MODE=WATCH ONLY] Output path */
      outPath: string | null
      /** [GLOBAL] Pages folder path */
      pagesPath: string
      /** [GLOBAL] Assets folder path (aka public / static / ~~void main~~) */
      assetsPath: string
      /** [GLOBAL] Route to root react _component_ that will get the routes injected */
      appRootPath: string
      /** [GLOBAL] Route to root react _router_ that will get injected into the root */
      siteRootTemplatePath: string
    }

    // --------- ESBuild ---------
    esbuild: {
      /** [MODE=WATCH ONLY] Port for the frontend webserver */
      frontendWatchPort: number | null
      /** [GLOBAL] Port for the backend webserver (in build mode the server is still used to generate all the paths) */
      backendWatchPort: number
    }

    // --------- Serve Config ---------

    /** [MODE=WATCH ONLY] The settings to use for the express server serving the live build */
    serveConfig?: ServeConfigType
  }

  type ServeConfigType = {
    /** Port number to use for serving the site */
    port: number
  }
}
