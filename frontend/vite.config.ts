import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { execSync } from 'node:child_process'

function runGit(cmd: string): string {
  try {
    return execSync(cmd, { cwd: __dirname, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return ''
  }
}

function getBuildMeta() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA
  const commit = sha && sha !== 'unknown' ? sha.slice(0, 7) : (runGit('git rev-parse --short HEAD') || 'unknown')

  const ts = process.env.VERCEL_GIT_COMMIT_TIMESTAMP
  let date = ''
  if (ts && ts !== 'unknown') {
    try {
      date = new Date(ts).toISOString().slice(0, 10)
    } catch { /* ignore invalid date */ }
  }
  if (!date) {
    date = runGit('git show -s --format=%cd --date=format:%Y-%m-%d HEAD') || new Date().toISOString().slice(0, 10)
  }

  return {
    commit,
    date,
    version: `v4.5.12`,
  }
}

const buildMeta = getBuildMeta()

export default defineConfig({
  define: {
    __APP_BUILD_COMMIT__: JSON.stringify((buildMeta.commit && buildMeta.commit !== 'unknown') ? buildMeta.commit : 'build'),
    __APP_BUILD_DATE__: JSON.stringify(buildMeta.date),
    __APP_BUILD_VERSION__: JSON.stringify(buildMeta.version),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://172.16.10.213:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/v1': {
        target: 'http://172.16.10.213:8000',
        changeOrigin: true,
      },
      '/healthz': {
        target: 'http://172.16.10.213:8000',
        changeOrigin: true,
      },
      '/openapi.json': {
        target: 'http://172.16.10.213:8000',
        changeOrigin: true,
      },
      '/docs': {
        target: 'http://172.16.10.213:8000',
        changeOrigin: true,
      },
    },
  },
})
