import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { execSync } from 'node:child_process'
import pkg from './package.json'

const getGitCommitDate = () => {
  try {
    return execSync('git log -1 --format=%cd --date=short').toString().trim()
  } catch {
    return ''
  }
}

export default defineConfig({
  base: '/app/',
  plugins: [vue()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __COMMIT_DATE__: JSON.stringify(getGitCommitDate()),
  },
  resolve: {
    conditions: ['browser'],
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    // Playwright specs under e2e/ are driven by `playwright test`, not Vitest.
    // Without this exclude, Vitest tries to collect them and fails on the
    // '@playwright/test' import.
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
  },
})
