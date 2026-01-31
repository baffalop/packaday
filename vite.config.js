import { defineConfig } from 'vite'
import melangePlugin from 'vite-plugin-melange'
import tailwindcss from '@tailwindcss/vite'
import { join } from 'path'
import { readFileSync } from 'fs'

// Custom plugin to resolve .mlx files to their compiled .js equivalents
function mlxResolverPlugin (options = {}) {
  const buildContext = options.buildContext || 'default'
  const emitDir = options.emitDir || '.'
  const buildTarget = options.buildTarget || 'output'

  return {
    name: 'vite-plugin-mlx-resolver',
    enforce: 'pre',

    resolveId (id, importer, options) {
      if (id.endsWith('.mlx')) {
        return id
      }
    },

    load (id) {
      if (id.endsWith('.mlx')) {
        const projectRoot = process.cwd()
        // id comes in as URL path like "/src/App.mlx"
        // Strip leading slash to get relative path
        const relPath = id.startsWith('/') ? id.slice(1) : id
        // Build path: _build/default/src/output/src/App.js
        const jsPath = join(
          projectRoot,
          '_build',
          buildContext,
          emitDir,
          buildTarget,
          relPath.replace(/\.mlx$/, '.js'),
        )
        // Read and return the compiled JS content directly
        try {
          return readFileSync(jsPath, 'utf-8')
        } catch (e) {
          console.error(`Failed to load compiled JS for ${id}: ${e.message}`)
          console.error(`Looked for: ${jsPath}`)
          return ''
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [
    mlxResolverPlugin({
      emitDir: 'src',
      buildTarget: 'output',
    }),
    melangePlugin({
      emitDir: 'src',
      buildTarget: 'output',
      buildCommand: 'opam exec -- dune build @app',
      watchCommand: 'opam exec -- dune build --watch @app',
    }),
    tailwindcss(),
  ],
  server: {
    watch: {
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 20,
      },
    },
  },
})
