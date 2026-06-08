import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    logOverride: { 'ts-error': 'silent' },
    tsconfigRaw: {
      compilerOptions: {
        jsx: 'react-jsx',
        skipLibCheck: true,
        noEmit: true,
        strict: false,
        noUnusedLocals: false,
        noUnusedParameters: false,
      },
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'TS_ERROR') return;
        warn(warning);
      },
    },
  },
})