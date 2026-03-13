# AI Daily Report 🤖📰

> 每日 AI 行业动态聚合站点 —— 追踪 AI 世界的脉搏

[![Daily Report](https://github.com/i5cn/ai-daily-report/actions/workflows/daily-report.yml/badge.svg)](https://github.com/i5cn/ai-daily-report/actions/workflows/daily-report.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 项目目标

AI Daily Report 是一个**自动化 AI 新闻聚合站点**，旨在：

- **每日定时**抓取 AI 领域的最新动态
- **智能筛选**高质量信息源（arXiv、Hacker News、AI 公司博客等）
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
│   ├── sources.json              # 新闻源配置
│   ├── reports/                  # 生成的报告数据 (JSON)
│   └── cache/                    # 抓取缓存
├── scripts/
│   ├── fetch-news.js             # 新闻抓取脚本
│   ├── generate-report.js        # 报告生成脚本
│   └── utils/
│       └── helpers.js            # 工具函数
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── ReportCard.astro      # 报告卡片组件
│   │       ├── ReportList.astro      # 报告列表组件
│   │       ├── LiquidBackground.astro # 液态背景动效
│   │       └── ViewCounter.astro     # 阅读计数
│   ├── layouts/
│   │   └── BaseLayout.astro          # 基础布局
│   ├── pages/
│   │   ├── index.astro               # 首页
│   │   ├── archive.astro             # 归档页
│   │   └── about.astro               # 关于页
│   ├── styles/
│   │   └── global.css                # 全局样式 + 设计 Token
│   └── types/
│       └── report.ts                 # TypeScript 类型定义
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
└── README.md
```

---

## 🚀 MVP 范围

### 第一阶段（当前）

- [x] 项目骨架搭建
- [ ] Liquid Metal 视觉风格首页
- [ ] ReportCard 组件（标题、摘要、来源、时间、图片、跳转按钮）
- [ ] 静态数据展示（mock 数据）
- [ ] GitHub Actions 定时构建部署

### 第二阶段（即将开始）

- [ ] RSS 源抓取脚本
- [ ] 数据持久化（JSON 文件）
- [ ] 每日自动更新内容
- [ ] 归档页面

### 第三阶段（规划中）

- [ ] AI 摘要生成（LLM 集成）
- [ ] 多语言支持
- [ ] 搜索功能
- [ ] 邮件订阅

---

## 🎨 设计系统

### Liquid Metal 视觉语言

- **色彩**: 银灰基调 + 流光渐变（Chrome, Silver, Graphite）
- **质感**: 液态金属反光、折射、流动感
- **动效**: 微弹性交互、流体过渡、光泽扫过效果
- **排版**: 现代无衬线，高对比度，呼吸感留白

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
```

---

## 📜 许可证

MIT © [i5cn](https://github.com/i5cn)

---

*Built with ❤️ and 🤖 by OpenClaw Agents*
