import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { createReadStream, statSync } from 'node:fs'
import { resolve, sep } from 'node:path'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}/` : '/'
const useLanHttp = process.env.VITE_LAN_HTTP === '1'
const usdzMimeType = 'model/vnd.usdz+zip'
const publicRoot = resolve(process.cwd(), 'public')

const createUsdzMiddleware = () => (request, response, next) => {
  const pathname = request.url?.split('?')[0]

  if (!pathname?.endsWith('.usdz')) {
    next()
    return
  }

  try {
    const filePath = resolve(publicRoot, decodeURIComponent(pathname.replace(/^\//, '')))
    const isPublicFile = filePath === publicRoot || filePath.startsWith(`${publicRoot}${sep}`)

    if (!isPublicFile) {
      next()
      return
    }

    const fileStat = statSync(filePath)

    response.statusCode = 200
    response.setHeader('Content-Type', usdzMimeType)
    response.setHeader('Content-Length', String(fileStat.size))
    createReadStream(filePath).pipe(response)
  } catch {
    next()
  }
}

const usdzMimePlugin = () => ({
  name: 'serve-usdz-mime',
  configureServer(server) {
    server.middlewares.use(createUsdzMiddleware())
  },
  configurePreviewServer(server) {
    server.middlewares.use(createUsdzMiddleware())
  }
})

export default defineConfig({
  base,
  plugins: [...(useLanHttp ? [] : [basicSsl()]), usdzMimePlugin()],
  server: {
    https: useLanHttp ? false : undefined
  },
  preview: {
    https: useLanHttp ? false : undefined
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        tilda: 'tilda-embed.html'
      }
    }
  }
})
