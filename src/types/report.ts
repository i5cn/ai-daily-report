/**
 * AI Daily Report - 类型定义
 * 定义日报卡片、日报页面及相关数据结构的 TypeScript 类型
 */

/**
 * 内容分类标签
 */
export type ContentTag =
  | 'model'        // 大模型/AI 模型
  | 'product'      // AI 产品发布
  | 'research'     // 学术研究
  | 'industry'     // 行业动态
  | 'policy'       // 政策法规
  | 'tool'         // 开发工具
  | 'event'        // 会议/活动
  | 'funding'      // 融资/投资
  | 'discussion'   // 社区讨论
  | 'community'    // 社区内容
  | 'local-ai'     // 本地 AI
  | 'open-source'  // 开源
  | 'openai';      // OpenAI 相关

/**
 * 内容来源类型
 */
export type SourceType = 'rss' | 'api' | 'manual' | 'community';

/**
 * 单条日报内容卡片
 * 首页列表展示的基本单元
 */
export interface ReportCard {
  /** 唯一标识 */
  id: string;
  /** 标题 */
  title: string;
  /** 摘要/简介（纯文本，限制长度） */
  summary: string;
  /** 完整内容（Markdown/HTML，可选） */
  content?: string;
  /** 来源名称 */
  source: string;
  /** 来源链接 */
  sourceUrl: string;
  /** 发布时间（ISO 8601 格式） */
  publishedAt: string;
  /** 采集时间 */
  fetchedAt: string;
  /** 封面图片 URL（可选） */
  imageUrl?: string;
  /** 内容标签（可多个） */
  tags: ContentTag[];
  /** 来源类型 */
  sourceType: SourceType;
  /** 阅读量/热度（可选） */
  hotScore?: number;
  /** 是否重点推荐 */
  featured?: boolean;
}

/**
 * 社区统计项
 */
export interface CommunityStat {
  name: string;
  count: number;
  url: string;
  type: string;
}

/**
 * 日报元数据
 */
export interface ReportMeta {
  /** 日报日期（YYYY-MM-DD） */
  date: string;
  /** 日报版本/期号 */
  edition: string;
  /** 生成时间（内部字段，不展示） */
  generatedAt: string;
  /** 内容总数 */
  totalCount: number;
  /** 社区内容数量 */
  communityCount?: number;
  /** 各分类统计 */
  tagStats: Record<string, number>;
  /** 编辑备注 */
  editorNote?: string;
  /** 来源健康状态（内部字段，不展示） */
  sourceHealth?: {
    total: number;
    healthy: number;
    failed: number;
    fixed?: string[];
    new?: string[];
  };
}

/**
 * 社区热议项（Reddit 等）
 */
export interface CommunityItem extends ReportCard {
  /** 子版块 */
  subreddit?: string;
  /** 讨论链接 */
  discussionUrl?: string;
}

/**
 * 完整日报数据结构
 * 对应 data/reports/latest.json 的结构
 */
export interface DailyReport {
  /** 版本号，用于数据迁移兼容 */
  version: string;
  /** 日报元数据 */
  meta: ReportMeta;
  /** 日报内容列表（按时间倒序） */
  items: ReportCard[];
  /** 来源站点统计 */
  sourceStats: {
    name: string;
    count: number;
    url: string;
  }[];
  /** 社区热议列表 */
  communityPulse?: CommunityItem[];
  /** 社区统计 */
  communityStats?: CommunityStat[];
}

/**
 * 首页列表数据（DailyReport 的精简版）
 */
export interface HomePageData {
  /** 日报日期 */
  date: string;
  /** 精选内容（最多 3 条） */
  featured: ReportCard[];
  /** 最新内容列表 */
  latest: ReportCard[];
  /** 分类统计 */
  tagStats: Record<ContentTag, number>;
}

/**
 * RSS 源配置
 */
export interface RssSource {
  /** 源 ID */
  id: string;
  /** 源名称 */
  name: string;
  /** RSS 地址 */
  url: string;
  /** 站点首页 */
  homepage: string;
  /** 默认标签 */
  defaultTags: ContentTag[];
  /** 更新频率（分钟） */
  interval: number;
  /** 是否启用 */
  enabled: boolean;
  /** 内容选择器（可选，用于抓取摘要） */
  selectors?: {
    /** 正文内容选择器 */
    content?: string;
    /** 图片选择器 */
    image?: string;
  };
}

/**
 * API 源配置
 */
export interface ApiSource {
  /** 源 ID */
  id: string;
  /** 源名称 */
  name: string;
  /** API 端点 */
  endpoint: string;
  /** 认证方式 */
  auth?: {
    type: 'header' | 'query';
    key: string;
    value: string;
  };
  /** 请求参数模板 */
  params?: Record<string, string | number>;
  /** 默认标签 */
  defaultTags: ContentTag[];
  /** 数据映射规则 */
  mapping: {
    title: string;
    summary: string;
    url: string;
    publishedAt: string;
    imageUrl?: string;
  };
  /** 是否启用 */
  enabled: boolean;
}

/**
 * 抓取结果
 */
export interface FetchResult {
  /** 来源 ID */
  sourceId: string;
  /** 来源名称 */
  sourceName: string;
  /** 成功状态 */
  success: boolean;
  /** 错误信息 */
  error?: string;
  /** 抓取到的内容 */
  items?: Omit<ReportCard, 'id' | 'fetchedAt'>[];
  /** 抓取时间 */
  fetchedAt: string;
  /** 耗时（毫秒） */
  duration: number;
}

/**
 * 原始内容项（抓取后、处理前的中间状态）
 */
export interface RawContentItem {
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  imageUrl?: string;
  tags: ContentTag[];
  sourceType: SourceType;
}
