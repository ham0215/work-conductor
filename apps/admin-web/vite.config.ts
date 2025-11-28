import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load HTTPS certificates if available (for local development)
  const certPath = path.resolve(__dirname, 'certs/localhost+2.pem')
  const keyPath = path.resolve(__dirname, 'certs/localhost+2-key.pem')
  const httpsConfig =
    fs.existsSync(certPath) && fs.existsSync(keyPath)
      ? {
          cert: fs.readFileSync(certPath),
          key: fs.readFileSync(keyPath),
        }
      : undefined

  return {
    plugins: [react()],
    build: {
      sourcemap: mode !== 'production',
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0'),
    },
    server: {
      https: httpsConfig,
    },
  }
})
