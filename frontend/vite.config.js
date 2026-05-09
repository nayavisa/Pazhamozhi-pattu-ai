import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use relative asset paths so the bundle works whether it's served from
// the site root or from a subpath like /ai-search/.
export default defineConfig({
  plugins: [react()],
  base: './',
})
