import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import ElementPlus from 'unplugin-element-plus/vite'

// https://vite.dev/config/
export default defineConfig(() => {
  const config: UserConfig = {
    plugins: [vue(), vueJsx(), ElementPlus({}), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    base: './',
    build: {
      outDir: '../../dist/webview',
      emptyOutDir: true,
      minify: true
    },
    server: {
      host: true,
      hmr: true,
      open: true
    }
  }
  return config
})
