import { defineConfig, devices } from '@playwright/experimental-ct-react'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  testDir: './tests/components',
  snapshotDir: './__snapshots__',
  timeout: 60000, // Extended timeout for OCaml compilation
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    ctPort: 3100,
    ctViteConfig: {
      plugins: [
        react(),
        tailwindcss(),
      ],
      resolve: {
        alias: {
          // Resolve Melange runtime modules
          'melange.js': path.resolve(__dirname, '_build/default/src/output/node_modules/melange.js'),
          melange: path.resolve(__dirname, '_build/default/src/output/node_modules/melange'),
          'reason-react': path.resolve(__dirname, '_build/default/src/output/node_modules/reason-react'),
        },
      },
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
})
