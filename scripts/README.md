# Scripts Directory

AI Daily Report 脚本目录，包含数据抓取和报告生成脚本。

## 目录结构

```
scripts/
├── README.md               # 本文件
├── fetch-news.js          # 新闻抓取主脚本
├── generate-report.js     # 报告生成脚本
└── utils/
    ├── helpers.js         # 通用工具函数
    ├── rss-parser.js      # RSS 解析器
    └── ai-summarizer.js   # AI 摘要生成（未来）
```

## 脚本说明

### fetch-news.js

从配置的源抓取最新新闻。

```bash
# 手动运行抓取
node scripts/fetch-news.js

# 抓取指定日期范围
node scripts/fetch-news.js --start 2026-03-01 --end 2026-03-13

# 调试模式（详细日志）
node scripts/fetch-news.js --debug
```

### generate-report.js

生成每日报告页面所需的数据文件。

```bash
# 生成今日报告
node scripts/generate-report.js

# 生成指定日期报告
node scripts/generate-report.js --date 2026-03-13

# 重新生成所有报告
node scripts/generate-report.js --all
```

## 开发规范

1. 所有脚本使用 ES Module (`type: "module"`)
2. 使用 `console.log` 输出关键步骤，便于 GitHub Actions 日志查看
3. 错误处理：使用 try-catch，失败时 process.exit(1)
4. 输出文件统一写入 `data/` 目录

## 环境变量

```bash
# 可选：用于 AI 摘要功能
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...

# 可选：用于某些需要认证的源
HACKER_NEWS_API_KEY=...
```
