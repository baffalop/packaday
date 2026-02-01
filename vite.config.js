import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import melange from 'vite-plugin-melange'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    melange({
      emitDir: 'src',
      buildTarget: 'output',
      buildCommand: 'opam exec -- dune build @app',
      watchCommand: 'opam exec -- dune build --watch @app',
    }),
    tailwindcss(),
  ],
  server: {
    watch: {
      // Watch _build for compiled output changes
      ignored: ['!**/_build/**'],
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 20,
      },
    },
  },
})
