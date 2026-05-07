import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Force lucide-react to be pre-bundled by esbuild (dev + prod).
  // lucide-react v1.x ships 1700+ individual ESM files; without this Rollup
  // can produce an output where the shared `Icon` const is referenced before
  // it is initialised, causing "Cannot access '…' before initialization".
  optimizeDeps: {
    include: ['lucide-react'],
  },

  build: {
    sourcemap: true,   // ← temporary: gives real file+line in browser errors
    rollupOptions: {
      output: {
        // Route modules to chunks by path, not just by entry point.
        // The object form of manualChunks only covers the listed entry points;
        // lucide-react v1.x ships 1700+ individual ESM files which Rollup resolves
        // to separate module IDs — only the function form catches all of them.
        // Putting every lucide-react module in its own chunk guarantees the entire
        // library (including the shared Icon const) is fully initialised before any
        // app code that imports from it, eliminating the ESM TDZ crash.
        manualChunks(id) {
          if (id.includes('lucide-react'))   return 'icons';
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('occt-import-js')) return 'occt';
          if (id.includes('node_modules'))   return 'vendor';
        },
      },
    },
  },

  // Proxy used when running `npm run dev` locally (Docker uses nginx.conf instead)
  // Order matters: more specific rules must come first.
  server: {
    proxy: {
      '/api/pno': 'http://localhost:8081',
      '/api':     'http://localhost:8080',
      '/ws':      { target: 'http://localhost:8080', ws: true },
    }
  }
})
