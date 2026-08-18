import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(currentDirectory, '../..')
const certificateKey = path.join(repositoryRoot, 'local.key')
const certificateFile = path.join(repositoryRoot, 'local.crt')
const hasCertificates = fs.existsSync(certificateKey) && fs.existsSync(certificateFile)

export default defineConfig({
  plugins: [
    vue({
      features: {
        optionsAPI: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(currentDirectory, 'src')
    }
  },
  publicDir: path.resolve(repositoryRoot, 'public'),
  server: {
    host: 'localhost',
    port: 8081,
    strictPort: true,
    https: hasCertificates
      ? {
          key: fs.readFileSync(certificateKey),
          cert: fs.readFileSync(certificateFile)
        }
      : undefined,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3002',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    host: 'localhost',
    port: 4173,
    strictPort: true
  }
})
