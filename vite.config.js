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
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "vendor-vue", test: /node_modules\/(?:vue|vue-router|pinia)\// },
            { name: "vendor-ag-grid-core", test: /node_modules\/ag-grid-community\// },
            { name: "vendor-ag-grid-vue", test: /node_modules\/(?:ag-grid-vue3|@ag-grid-community\/locale)\// },
            { name: "vendor-permission-tree", test: /node_modules\/vue3-tree-vue\// },
          ],
        },
      },
    },
  },

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
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3002',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/authorization-events': { target: 'http://127.0.0.1:3002', changeOrigin: true, secure: false, ws: true }
    }
  },
  preview: {
    host: 'localhost',
    port: 4173,
    strictPort: true
  }
})
