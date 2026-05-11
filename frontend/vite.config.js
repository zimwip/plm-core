import { defineConfig } from 'vite'
import { resolve } from 'path'
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
      // Explicit shim entries are the key to stable export names.
      // Rollup preserves export names for entry-point chunks but may mangle
      // them for shared chunks (manualChunks).  React packages must be owned
      // by their shim entry so the importmap URLs resolve with correct names.
      input: {
        index:                     resolve(__dirname, 'index.html'),
        'vendor-react':            resolve(__dirname, 'src/react-shim.js'),
        'vendor-react-dom':        resolve(__dirname, 'src/react-dom-shim.js'),
        'vendor-react-jsx-runtime': resolve(__dirname, 'src/react-jsx-runtime-shim.js'),
      },
      // Remote plugins are loaded at runtime and are not in the Rollup module
      // graph.  Rollup would normally tree-shake shim exports that appear unused,
      // breaking `import { useState } from 'react'` inside plugin bundles.
      // 'strict' preserves every export declared by each entry point as-is.
      preserveEntrySignatures: 'strict',
      output: {
        entryFileNames: (chunkInfo) => {
          // Shim entries get stable names (no hash) so the importmap in index.html
          // can reference them without a build step to update it.
          if (chunkInfo.name?.startsWith('vendor-react')) return 'assets/[name].js';
          return 'assets/[name]-[hash].js';
        },
        manualChunks(id) {
          if (id.includes('lucide-react'))       return 'icons';
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('occt-import-js'))     return 'occt';
          // React packages (react, react-dom, react/jsx-runtime, scheduler) must NOT
          // be assigned here.  Assigning them to 'vendor' puts them in a non-entry
          // chunk whose exports Rollup mangles, breaking remote plugin bare imports.
          // Leaving them unassigned lets Rollup place them relative to their shim
          // entry points, keeping the entry-level exports intact.
          if (id.includes('/node_modules/react') ||
              id.includes('/node_modules/scheduler')) return undefined;
          if (id.includes('node_modules'))       return 'vendor';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
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
