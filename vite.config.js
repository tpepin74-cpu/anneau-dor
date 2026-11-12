import { defineConfig } from 'vite';
export default defineConfig({
  server: { host: '0.0.0.0', allowedHosts: ['terminal.local'] },
  build: { rollupOptions: {
    input: { home: 'index.html', creations: 'creations/index.html' },
    onwarn(warning, warn) { if(warning.code==='MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) return; warn(warning); },
    output: { manualChunks: { three: ['three'], motion: ['framer-motion'], react: ['react','react-dom'] } }
  } }
});
