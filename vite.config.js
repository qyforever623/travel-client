import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    server: {
      proxy: {
        // 浏览器请求同源的 /api，由 Vite 开发服务器转发到后端，因此开发时不需要后端配置 CORS。
        '/api': {
          // 保留 /api 前缀；后端路由注册在 /api/travel 下。
          target: env.API_PROXY_TARGET || 'http://localhost:9000',
          changeOrigin: true
        }
      }
    }
  }
})
