import { defineConfig } from 'vite';

export default defineConfig({
  // 若部署到 GitHub Pages 子路徑，改成 '/repo-name/'
  base: '/',
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
