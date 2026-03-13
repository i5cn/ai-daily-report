# Data Directory

AI Daily Report 数据存储目录。

## 目录结构

```
data/
├── README.md           # 本文件
├── sources.json        # 新闻源配置
├── reports/            # 生成的报告数据
│   ├── 2026-03-13.json
│   ├── 2026-03-12.json
│   └── ...
└── cache/              # 抓取缓存
    └── feed-cache.json
```

## 文件说明

### sources.json

配置新闻源列表，包括 RSS、API 或爬虫配置。

```json
{
  "version": "1.0.0",
  "sources": [
    {
      "id": "openai-blog",
      "name": "OpenAI Blog",
      "type": "rss",
      "url": "https://openai.com/blog/rss.xml",
      "category": "research",
      "enabled": true
    }
  ]
}
```

### reports/*.json

每日生成的报告数据文件。

```json
{
  "date": "2026-03-13",
  "generatedAt": "2026-03-13T08:00:00Z",
  "totalCount": 12,
  "reports": [
    {
      "id": "uuid",
      "title": "...",
      "summary": "...",
      "source": "...",
      "sourceUrl": "...",
      "publishedAt": "...",
      "tags": [...]
    }
  ]
}
```

## 数据保留策略

- 最近 30 天的报告完整保留
- 历史数据归档到 `archive/` 目录
- 缓存文件 7 天自动清理
