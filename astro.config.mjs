import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://i5cn.github.io',
  base: '/ai-daily-report',
  
  // 输出配置
  output: 'static',
  
  // 构建配置
  build: {
    format: 'directory',
    assets: '_assets',
  },
  
  // 开发服务器配置
  server: {
    port: 4321,
    host: true,
  },
  
  // 标记为实验性功能（如需要）
  experimental: {},
});
