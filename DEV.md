# AI Daily Report - 开发文档

## 项目结构

```
ai-daily-report/
├── .github/workflows/       # GitHub Actions 工作流
│   └── daily-report.yml     # 每日自动构建部署
├── data/
│   ├── cache/               # 缓存数据
│   ├── raw/                 # 抓取原始数据
│   └── reports/             # 生成的报告
├── public/                  # 静态资源
│   ├── favicon.svg
│   └── og-image.png         # OG 图片
├── scripts/                 # 工具脚本
│   ├── fetch-news.js        # 抓取新闻
│   ├── generate-report.js   # 生成报告
│   └── generate-og-image.js # 生成 OG 图片
├── src/
│   ├── components/
│   │   ├── sections/        # 页面区块组件
│   │   │   ├── GlobalRail.astro
│   │   │   ├── HeroSection.astro
│   │   │   ├── CategorySection.astro
│   │   │   ├── CommunitySection.astro
│   │   │   ├── SourceLedger.astro
│   │   │   └── Footer.astro
│   │   └── ui/              # UI 组件
│   │       └── ReportCard.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── lib/                 # 工具函数
│   │   └── data.ts
│   ├── pages/
│   │   ├── index.astro      # 首页
│   │   ├── archive.astro    # 归档页
│   │   └── about.astro      # 关于页
│   ├── styles/
│   │   └── global.css
│   └── types/
│       └── report.ts
└── astro.config.mjs
```

## 常用命令

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 构建
npm run build

# 抓取新闻
npm run fetch

# 生成报告
npm run generate

# 预览构建
npm run preview

# 运行测试
npm test
```

## 数据流

1. **抓取** (`fetch-news.js`): 从 RSS/API 源抓取原始数据 → `data/raw/fetch-latest.json`
2. **生成** (`generate-report.js`): 处理原始数据 → `data/reports/latest.json`
3. **展示** (Astro): 读取报告数据渲染页面

## 部署

- **自动部署**: 每天 08:00 (北京时间) 自动抓取并部署
- **手动触发**: GitHub Actions 页面点击 "Run workflow"
- **Push 触发**: 推送到 main 分支自动部署

## 添加新的 RSS 源

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

## 环境变量

如需 API Key，在 GitHub 仓库 Settings → Secrets 添加:

- `OPENAI_API_KEY`: OpenAI API 密钥（如需要）

## 性能优化

- 图片使用 `loading="lazy"` 懒加载
- 字体使用 `font-display: swap`
- 支持 `prefers-reduced-motion` 减弱动效
- CSS 动画使用 `will-change: transform`

## 技术栈

- **框架**: Astro 5.x
- **样式**: Tailwind CSS 4.x
- **类型**: TypeScript
- **部署**: GitHub Pages
- **CI/CD**: GitHub Actions
