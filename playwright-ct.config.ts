import { defineConfig, devices } from '@playwright/experimental-ct-react'
import react from '@vitejs/plugin-react'
import melange from 'vite-plugin-melange'
import tailwindcss from '@tailwindcss/vite'

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
        melange({
          duneDir: '..',
          emitDir: '../src',
          buildTarget: 'output',
          buildCommand: 'opam exec -- dune build @app',
          watchCommand: 'opam exec -- dune build --watch @app',
        }),
        tailwindcss(),
      ],
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
