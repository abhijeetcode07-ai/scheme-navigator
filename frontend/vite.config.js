import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { handleGeminiRequest } from './src/server/gemini.mjs'

export default defineConfig({
  server: { allowedHosts: ['.manus.computer', 'localhost'] },
  plugins: [
    react(),
    {
      name: 'scheme-setu-gemini-dev-api',
      configureServer(server) {
        server.middlewares.use('/api/gemini', async (request, response) => {
          if (request.method !== 'POST') {
            response.statusCode = 405
            response.setHeader('Content-Type', 'application/json')
            response.end(JSON.stringify({ code: 'method_not_allowed', message: 'Only POST is supported.' }))
            return
          }
          let raw = ''
          for await (const chunk of request) raw += chunk
          let body = null
          try { body = JSON.parse(raw || '{}') } catch { body = null }
          const result = await handleGeminiRequest({ method: request.method, body })
          response.statusCode = result.status
          response.setHeader('Cache-Control', 'no-store')
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify(result.body))
        })
      },
    },
  ],
})
