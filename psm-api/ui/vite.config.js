import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        nav: 'src/nav.jsx',
        editor: 'src/editor.jsx',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-dom/client'],
    },
    outDir: '../src/main/resources/static/ui',
    emptyOutDir: true,
  },
})
