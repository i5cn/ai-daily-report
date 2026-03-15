# AI Signal Surface 🤖📰

> 每日 AI 行业动态聚合站点 —— 追踪 AI 世界的脉搏

[![Daily Report](https://github.com/i5cn/ai-daily-report/actions/workflows/daily-report.yml/badge.svg)](https://github.com/i5cn/ai-daily-report/actions/workflows/daily-report.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 项目目标

AI Signal Surface 是一个**自动化 AI 新闻聚合站点**，旨在：

- **每日定时**抓取 AI 领域的最新动态
- **智能筛选**高质量信息源（OpenAI、Google AI、Hugging Face、Reddit 等）
- **优雅呈现**以 Liquid Metal 液态金属风格打造沉浸式阅读体验
- **零维护**全自动构建部署，GitHub Pages 托管

---

## 🛠️ 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| **框架** | [Astro](https://astro.build/) | 静态站点生成，极致性能 |
| **样式** | Tailwind CSS v4 | 原子化 CSS，响应式设计 |
| **视觉** | Liquid Metal Design | 液态金属美学，动态光影 |
| **部署** | GitHub Pages | 免费托管，CDN 加速 |
| **CI/CD** | GitHub Actions | 定时任务，自动构建部署 |
| **数据源** | RSS / API / Scraping | 多源聚合 |

---

## 📁 目录结构

```
ai-daily-report/
├── .github/
│   └── workflows/
│       └── daily-report.yml      # 定时工作流：抓取 → 构建 → 部署
├── data/
│   ├── cache/                    # 抓取缓存
│   ├── raw/                      # 抓取原始数据
│   └── reports/                  # 生成的报告数据
├── scripts/
│   ├── fetch-news.js             # 新闻抓取脚本
│   ├── generate-report.js        # 报告生成脚本
│   └── generate-og-image.js      # OG 图片生成脚本
├── src/
│   ├── components/
│   │   ├── sections/             # 页面区块组件
│   │   │   ├── GlobalRail.astro
│   │   │   ├── HeroSection.astro
│   │   │   ├── CategorySection.astro
│   │   │   ├── CommunitySection.astro
│   │   │   ├── SourceLedger.astro
│   │   │   └── Footer.astro
│   │   └── ui/
│   │       └── ReportCard.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── lib/
│   │   └── data.ts               # 数据处理工具
│   ├── pages/
│   │   ├── index.astro           # 首页
│   │   ├── archive.astro         # 归档页
│   │   └── about.astro           # 关于页
│   ├── styles/
│   │   └── global.css
│   └── types/
│       └── report.ts
├── astro.config.mjs
├── package.json
├── README.md
└── DEV.md                        # 开发文档
```

---

## 🚀 功能特性

### 已实现 ✅

- [x] Liquid Metal 视觉风格首页
- [x] ReportCard 组件（标题、摘要、来源、时间、热度）
- [x] 首页轮播展示热门内容
- [x] 分类浏览（模型、产品、研究、行业、工具、政策）
- [x] Reddit 社区热议聚合
- [x] RSS 源抓取脚本
- [x] 数据持久化（JSON 文件）
- [x] 每日自动更新内容
- [x] 归档页面
- [x] 关于页面
- [x] GitHub Actions 定时构建部署
- [x] OG 图片生成
- [x] SEO 优化（Open Graph、结构化数据）
- [x] 响应式设计

### 规划中 📋

- [ ] AI 摘要生成（LLM 集成）
- [ ] 多语言支持
- [ ] 搜索功能
- [ ] 邮件订阅

---

## 🎨 设计系统

### Liquid Metal 视觉语言

- **色彩**: 深空黑底 + 流光渐变（红、青、紫）
- **质感**: 液态金属反光、折射、流动感
- **动效**: 微弹性交互、流体过渡、光泽扫过效果
- **排版**: Outfit + Manrope + IBM Plex Mono，高对比度

详见 `src/styles/global.css` 中的 Design Token 定义。

---

## 🏃 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 抓取新闻
npm run fetch

# 生成报告
npm run generate

# 抓取 + 生成（一键更新）
npm run update
```

详细开发文档请查看 [DEV.md](./DEV.md)。

---

## 🌐 页面

- **首页** (`/`): 展示今日 AI 资讯、分类浏览、社区热议
- **归档** (`/archive`): 按日期查看历史资讯
- **关于** (`/about`): 项目介绍、数据来源、技术栈

---

## ⚙️ 配置

### 添加 RSS 源

编辑 `scripts/fetch-news.js`:

```javascript
const RSS_SOURCES = [
  {
    id: 'source-id',
    name: 'Source Name',
    url: 'https://example.com/feed.xml',
    homepage: 'https://example.com',
    defaultTags: ['industry'],
    interval: 60,
    enabled: true,
    layer: 'primary',
  },
];
```

### 环境变量

如需 API Key，在 GitHub 仓库 Settings → Secrets 添加。

---

## 📜 许可证

MIT © [i5cn](https://github.com/i5cn)

---

*Built with ❤️ and 🤖 by OpenClaw Agents*
