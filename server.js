import fs from 'node:fs/promises'
import path from 'path'
import express from 'express'

const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const base = process.env.BASE || '/'
const resolve = (p) => path.resolve(p)


const templateHtml = isProduction
  ? await fs.readFile(resolve('dist/client/index.html'), 'utf-8')
  : ''
const ssrManifest = isProduction
  ? await fs.readFile(resolve('dist/client/.vite/ssr-manifest.json'), 'utf-8')
  : undefined

const app = express()

let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base
  })
  app.use(vite.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv('./dist/client', { extensions: [] }))
}

app.use('*', async (req, res) => {
  try {
    const url = req.originalUrl
    let template
    let render
    if (!isProduction) {
      template = await fs.readFile(resolve('index.html'), 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      render = (await vite.ssrLoadModule('/src/ssr/entry-server.js')).render
    } else {
      template = templateHtml
      render = (await import('./dist/server/entry-server.js')).render
    }

    const rendered = await render(url, ssrManifest)

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? '')
      .replace(`<!--app-html-->`, rendered.html ?? '')
      .replace(`<!--app-title-->`, rendered.title)

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
  } catch (e) {
    vite?.ssrFixStacktrace(e)
    console.log(e)
    res.status(500).end(e)
  }
})

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})