import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Optimized chunking strategy for Recharts and Date-Fns
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
             if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
             }
             if (id.includes('date-fns')) {
                return 'vendor-dateutils';
             }
             return 'vendor';
          }
        }
      }
    },
    // Increased chunk size warning limit to accommodate high-resolution charting libraries
    chunkSizeWarningLimit: 1200
  }
})
