import { defineConfig } from 'vite';

// GitHub Pages 子路徑：/jiejie_resume2026/
// 本地開發維持 base: '/'
const repoBase = '/jiejie_resume2026/';

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? repoBase : '/',
  root: '.',
  publicDir: 'public',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
});
