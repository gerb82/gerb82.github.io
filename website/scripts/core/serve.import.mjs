// Sourced and tweaked from the node.js docs - https://nodejs.org/api/module.html#import-from-https
import { get } from 'node:http'

// Load function executed with the url being imported
export function load(url, context, nextLoad) {
  // If this url uses the fictituous `siteroot://` protocol (previously named `lie://` for all of five minutes)

  // Note that we cannot do this with the http protocol directly because node will prevent it from making further imports,
  // since despite not supporting http imports properly, node DOES have opaque undocumented behaviors applied when you do import something it thinks uses http
  // (i suspect this might be due to the experimental http loaders support, but i frankly do not care enough to verify)
  if (url.startsWith('siteroot://')) {
    // Fetch the file from the provided http path
    return new Promise((resolve, reject) => {
      // Do a GET request
      get(url.replace('siteroot://', 'http://'), (res) => {
        // The accumulated data
        let data = ''
        // Set the encoding
        res.setEncoding('utf8')
        // Append the data
        res.on('data', chunk => data += chunk)
        // Once done, actually return it
        res.on('end', () => resolve({
          // Under ideal circumstances, this would be a module. However, that causes a native node crash and i'm not that petty
          format: 'commonjs',
          // Tell node to stop the loader chain
          shortCircuit: true,
          // The code to load
          source: data,
        }))
      }).on('error', err => reject(err))
    })
  }

  // If this is not a siteroot request, let Node.js handle all other URLs.
  return nextLoad(url)
}
