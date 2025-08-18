import { defineConfig } from 'vite';
import path from 'node:path';

// ライブラリモード + IIFE 単一ファイル出力（GROWI の Script Plugin で扱いやすい）
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    lib: {
      entry: path.resolve(__dirname, 'client-entry.tsx'),
      name: 'GrowiPluginSearchIncludeUserDefault',
      formats: ['iife'],
      fileName: () => 'client-entry.js'
    },
    rollupOptions: {
      external: [],
      output: { extend: true }
    }
  }
});
