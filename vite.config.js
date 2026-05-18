import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function getProxyTargetFromApiBase(apiBaseUrl) {
  if (!apiBaseUrl) return null

  // expects e.g. https://xxxx.ngrok-free.app/api -> https://xxxx.ngrok-free.app
  const trimmed = String(apiBaseUrl).replace(/\/+$/, '')
  return trimmed.replace(/\/api$/i, '')
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.VITE_API_BASE_URL
  const proxyTarget = getProxyTargetFromApiBase(apiBaseUrl)

  return {
    plugins: [react()],
    server: proxyTarget
      ? {
          proxy: {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
              secure: true,
              configure(proxy) {
                proxy.on('proxyReq', (proxyReq) => {
                  proxyReq.setHeader('ngrok-skip-browser-warning', 'true')
                })
              },
            },
          },
        }
      : undefined,
  }
})
