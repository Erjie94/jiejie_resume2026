import { readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig } from 'vite';

// GitHub Pages 子路徑：/jiejie_resume2026/
// 本地開發維持 base: '/'
const repoBase = '/jiejie_resume2026/';

// 備審、自傳等文件放在 public/ 會被原樣發布。搜尋引擎不應找到它們，網站也不需要這些檔。
function omitPrivateDocuments() {
  return {
    name: 'omit-private-documents',
    apply: 'build',
    async closeBundle() {
      const outDir = path.resolve('dist');
      async function walk(dir) {
        let entries;
        try {
          entries = await readdir(dir, { withFileTypes: true });
        } catch {
          return;
        }
        await Promise.all(
          entries.map(async (entry) => {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              await walk(full);
              return;
            }
            if (entry.name.toLowerCase().endsWith('.docx')) await unlink(full);
          }),
        );
      }
      await walk(outDir);
    },
  };
}

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? repoBase : '/',
  root: '.',
  publicDir: 'public',
  plugins: [omitPrivateDocuments()],
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
