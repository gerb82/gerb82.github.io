import { RenderSite } from '@SiteRoot'
import { hydrateRoot } from 'react-dom/client'

hydrateRoot(
  // @ts-expect-error not worth defining a whole separate ts-config just to tell this that it runs in a browser context
  document,
  <RenderSite />,
)
