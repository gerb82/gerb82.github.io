import { BuildConfigType } from '@SiteRoot'
import fs from 'fs'
import Path from 'path'

// TODO - clean up this file

function CollectDirectory(relativePath: string, path: string, config: BuildConfigType) {
  const allPages: [string, string][] = []
  const paths = fs.readdirSync(path)
  paths.forEach((rawChildPath) => {
    const childPath = Path.resolve(path, rawChildPath)
    const relativeChildPath = relativePath === '' ? rawChildPath : `${relativePath}/${rawChildPath}`
    if (fs.statSync(childPath).isDirectory()) {
      allPages.push(...CollectDirectory(relativeChildPath, childPath, config))
    }
    else {
      allPages.push([relativeChildPath.split('.')[0], childPath.replaceAll('\\', '\\\\')])
    }
  })

  return allPages
}

function AssembleSitemap(config: BuildConfigType) {
  const allPages = CollectDirectory('', config.paths.pagesPath, config)

  // Combine spec (config.sitemap.sitemapTemplatePath) with dynamic sitemap calculated above
  // Do this by es-building the file and putting replacements onLoad
  // fs.writeFileSync(config.sitemap.sitemapPath, 'TODO - sitemap content here')

  return allPages
}

export default function BuildSitemap(config: BuildConfigType) {
  return AssembleSitemap(config)

  if (config.watch)
    fs.watch(config.pagesPath).addListener('change', () => {
      // TODO - potentially make this only refetch the relevant file
      AssembleSitemap(config)
    })
}
