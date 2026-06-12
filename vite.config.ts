import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/NovalGram/',
  plugins: [react()],
  build: {
    target: 'esnext',
  },
})