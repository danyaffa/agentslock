import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Allow ADMIN_ACCESS_PASSWORD without VITE_ prefix (maps to VITE_ version for client access)
    'import.meta.env.VITE_ADMIN_ACCESS_PASSWORD': JSON.stringify(process.env.ADMIN_ACCESS_PASSWORD || process.env.VITE_ADMIN_ACCESS_PASSWORD || ''),
  },
})
