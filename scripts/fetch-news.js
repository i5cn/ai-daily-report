#!/usr/bin/env node

/**
 * AI Daily Report - 新闻抓取脚本 (ESM 版本)
 * 
 * 功能：从白名单 RSS 源和 API 抓取 AI 相关新闻
 * 输出：原始内容数据（JSON 格式），供 generate-report.js 处理
 * 
 * 使用方法：
 *   node scripts/fetch-news.js              # 抓取所有启用源
 *   node scripts/fetch-news.js --source=rss # 仅抓取 RSS 源
 *   node scripts/fetch-news.js --dry-run    # 模拟运行，不保存
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { XMLParser } from 'fast-xml-parser';

// ESM 中模拟 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============ 配置区域 ============

/**
 * 白名单 RSS 源配置 - 主资讯层
 * 仅从此列表中的源抓取内容
 */
const RSS_SOURCES = [
  {
    id: 'openai-blog',
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss.xml',
    homepage: 'https://openai.com',
    defaultTags: ['model', 'product'],
    interval: 30,
    enabled: true,
    layer: 'primary', // 主资讯层
  },
  {
    id: 'google-ai-blog',
    name: 'Google AI Blog',
    url: 'https://blog.google/technology/ai/rss/',
    homepage: 'https://blog.google/technology/ai/',
    defaultTags: ['model', 'research'],
    interval: 60,
    enabled: true,
    layer: 'primary',
  },
  {
    id: 'huggingface-blog',
    name: 'Hugging Face Blog',
    url: 'https://huggingface.co/blog/feed.xml',
    homepage: 'https://huggingface.co',
    defaultTags: ['tool', 'model'],
    interval: 120,
    enabled: true,
    layer: 'primary',
  },
  {
    id: 'mit-news-ai',
    name: 'MIT News - AI',
    url: 'https://news.mit.edu/rss/topic/artificial-intelligence2',
    homepage: 'https://news.mit.edu',
    defaultTags: ['research'],
    interval: 60,
    enabled: true,
    layer: 'primary',
  },
  {
    id: 'arstechnica-ai',
    name: 'Ars Technica - AI',
    url: 'https://arstechnica.com/tag/artificial-intelligence/feed/',
    homepage: 'https://arstechnica.com',
    defaultTags: ['industry', 'policy'],
    interval: 60,
    enabled: true,
    layer: 'primary',
  },
  {
    id: 'techcrunch-ai',
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    homepage: 'https://techcrunch.com',
    defaultTags: ['industry', 'startup'],
    interval: 60,
    enabled: true,
    layer: 'primary',
  },
];

/**
 * Reddit 社区热议源配置 - Community Pulse 层
 * 单独的热度和讨论数据
 */
const COMMUNITY_SOURCES = [
  {
    id: 'reddit-artificial',
    name: 'Reddit r/artificial',
    url: 'https://www.reddit.com/r/artificial.rss',
    homepage: 'https://www.reddit.com/r/artificial',
    defaultTags: ['discussion', 'community'],
    interval: 30,
    enabled: true,
    layer: 'community',
    subreddit: 'artificial',
  },
  {
    id: 'reddit-machinelearning',
    name: 'Reddit r/MachineLearning',
    url: 'https://www.reddit.com/r/MachineLearning.rss',
    homepage: 'https://www.reddit.com/r/MachineLearning',
    defaultTags: ['discussion', 'research'],
    interval: 60,
    enabled: true,
    layer: 'community',
    subreddit: 'MachineLearning',
  },
  {
    id: 'reddit-localllama',
    name: 'Reddit r/LocalLLaMA',
    url: 'https://www.reddit.com/r/LocalLLaMA.rss',
    homepage: 'https://www.reddit.com/r/LocalLLaMA',
    defaultTags: ['discussion', 'local-ai', 'open-source'],
    interval: 60,
    enabled: true,
    layer: 'community',
    subreddit: 'LocalLLaMA',
  },
  {
    id: 'reddit-openai',
    name: 'Reddit r/OpenAI',
    url: 'https://www.reddit.com/r/OpenAI.rss',
    homepage: 'https://www.reddit.com/r/OpenAI',
    defaultTags: ['discussion', 'openai'],
    interval: 60,
    enabled: true,
    layer: 'community',
    subreddit: 'OpenAI',
  },
];

/**
 * API 源配置
 */
const API_SOURCES = [
  {
    id: 'github-trending',
    name: 'GitHub Trending AI',
    endpoint: 'https://api.github.com/search/repositories',
    params: { q: 'topic:artificial-intelligence', sort: 'updated', per_page: 10 },
    defaultTags: ['tool'],
    enabled: false, // 默认关闭，需要配置 token
  },
];

// ============ 工具函数 ============

/**
 * 生成唯一 ID
 */
function generateId(prefix = 'item') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * 解析日期，统一返回 ISO 格式
 */
function parseDate(dateStr) {
  if (!dateStr) return new Date().toISOString();
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

/**
 * 提取纯文本（去除 HTML 标签）
 */
function extractText(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 生成摘要（限制长度）
 */
function generateSummary(content, maxLength = 280) {
  const text = extractText(content);
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * 从 URL 提取域名作为来源名
 */
function extractSourceName(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '').split('.')[0];
  } catch {
    return 'Unknown Source';
  }
}

/**
 * 延迟函数
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 提取图片 URL - 增强版
 * 支持多种 RSS 格式和 OG 图预留
 */
function extractImageUrl(item, sourceUrl) {
  // 1. 优先从 media:content 提取（YouTube、Reddit 等常用）
  const mediaContent = item['media:content'] || item['media:thumbnail'];
  if (mediaContent) {
    if (typeof mediaContent === 'object') {
      if (mediaContent['@_url']) return mediaContent['@_url'];
      // 处理数组形式
      if (Array.isArray(mediaContent) && mediaContent[0]?.['@_url']) {
        return mediaContent[0]['@_url'];
      }
    }
  }

  // 2. 从 enclosure 提取（播客、视频常用）
  if (item.enclosure?.['@_url']) {
    return item.enclosure['@_url'];
  }

  // 3. 从 content 中提取第一张图片
  const content = item['content:encoded'] || item.description || item.content || item.summary || '';
  if (typeof content === 'string') {
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) {
      return imgMatch[1];
    }
  }

  // 4. 从 itunes:image 提取
  if (item['itunes:image']?.['@_href']) {
    return item['itunes:image']['@_href'];
  }

  // 5. 从 thumbnail 提取（YouTube 等）
  if (item['thumbnail']?.['@_url']) {
    return item['thumbnail']['@_url'];
  }

  // 6. TODO: OG 图抓取预留
  // 如果以上都失败，返回 null，后续可通过 fetchOGImage 补充
  // 格式：需要异步抓取 sourceUrl 页面的 og:image meta 标签
  return null;
}

/**
 * 异步抓取 OG 图（预留函数）
 * @param {string} url - 文章 URL
 * @returns {Promise<string|null>} - OG 图 URL 或 null
 */
async function fetchOGImage(url) {
  // TODO: 实现 OG 图抓取逻辑
  // 1. fetch 页面内容
  // 2. 解析 HTML 提取 og:image 或 twitter:image
  // 3. 返回图片 URL
  // 注意：需要添加缓存和错误处理
  return null;
}

// ============ 抓取实现 ============

/**
 * 抓取单个 RSS 源
 * @param {Object} source RSS 源配置
 * @returns {Promise<Object>} 抓取结果
 */
async function fetchRssSource(source) {
  const startTime = Date.now();
  const result = {
    sourceId: source.id,
    sourceName: source.name,
    success: false,
    error: null,
    items: [],
    fetchedAt: new Date().toISOString(),
    duration: 0,
    layer: source.layer || 'primary',
  };

  try {
    console.log(`📡 Fetching RSS: ${source.name} (${source.layer || 'primary'}) ...`);
    
    // 设置请求头，模拟浏览器
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'AI-Daily-Report/1.0 (Bot; Contact: admin@example.com)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xmlText = await response.text();
    
    // 解析 XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseTagValue: false,
    });
    const parsed = parser.parse(xmlText);

    // 提取条目（兼容 RSS 2.0 和 Atom）
    const entries = parsed.rss?.channel?.item || 
                   parsed.feed?.entry || 
                   [];
    const items = Array.isArray(entries) ? entries : [entries].filter(Boolean);

    // 转换为标准格式
    result.items = items.map((item) => {
      const title = item.title || 'Untitled';
      
      // 处理 link 字段（可能是字符串或对象）
      let link = '';
      if (typeof item.link === 'string') {
        link = item.link;
      } else if (item.link?.['#text']) {
        link = item.link['#text'];
      } else if (item.link?.['@_href']) {
        link = item.link['@_href'];
      } else if (item.guid) {
        link = typeof item.guid === 'string' ? item.guid : item.guid['#text'];
      }
      
      const content = item['content:encoded'] || item.description || item.content || item.summary || '';
      const pubDate = item.pubDate || item.published || item.updated || item['dc:date'] || '';
      
      // 提取图片
      const imageUrl = extractImageUrl(item, link);

      // 社区层特有字段
      const communityData = {};
      if (source.layer === 'community') {
        // Reddit 特有的字段
        if (source.subreddit) {
          communityData.subreddit = source.subreddit;
          // 从 title 提取讨论热度指标（如果有）
          communityData.discussionType = 'hot'; // 默认 hot，可扩展为 new/top
        }
      }

      return {
        id: generateId(source.id),
        title: extractText(title),
        summary: generateSummary(content),
        source: source.name,
        sourceUrl: link,
        publishedAt: parseDate(pubDate),
        imageUrl,
        tags: [...source.defaultTags],
        sourceType: 'rss',
        layer: source.layer || 'primary',
        ...communityData,
      };
    }).filter(item => item.title && item.title !== 'Untitled' && item.sourceUrl);

    result.success = true;
    console.log(`✅ ${source.name}: 抓取 ${result.items.length} 条`);

  } catch (error) {
    result.error = error.message;
    console.error(`❌ ${source.name}: ${error.message}`);
  }

  result.duration = Date.now() - startTime;
  return result;
}

/**
 * 抓取单个 API 源
 * @param {Object} source API 源配置
 * @returns {Promise<Object>} 抓取结果
 */
async function fetchApiSource(source) {
  const startTime = Date.now();
  const result = {
    sourceId: source.id,
    sourceName: source.name,
    success: false,
    error: null,
    items: [],
    fetchedAt: new Date().toISOString(),
    duration: 0,
    layer: 'primary',
  };

  try {
    console.log(`🔌 Fetching API: ${source.name} ...`);

    // 构建 URL
    const url = new URL(source.endpoint);
    if (source.params) {
      Object.entries(source.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers = {
      'User-Agent': 'AI-Daily-Report/1.0',
      'Accept': 'application/json',
    };

    // 添加认证
    if (source.auth) {
      if (source.auth.type === 'header') {
        headers[source.auth.key] = source.auth.value;
      } else if (source.auth.type === 'query') {
        url.searchParams.append(source.auth.key, source.auth.value);
      }
    }

    const response = await fetch(url.toString(), {
      headers,
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // 根据具体 API 格式解析
    const rawItems = Array.isArray(data) ? data : data.items || data.results || [];

    result.items = rawItems.slice(0, 10).map((item) => ({
      id: generateId(source.id),
      title: item.title || item.name || 'Untitled',
      summary: generateSummary(item.description || item.summary || ''),
      source: source.name,
      sourceUrl: item.url || item.html_url || item.link || '',
      publishedAt: parseDate(item.published_at || item.created_at || item.date),
      imageUrl: item.image || item.imageUrl || null,
      tags: [...source.defaultTags],
      sourceType: 'api',
      layer: 'primary',
    })).filter(item => item.title && item.title !== 'Untitled');

    result.success = true;
    console.log(`✅ ${source.name}: 抓取 ${result.items.length} 条`);

  } catch (error) {
    result.error = error.message;
    console.error(`❌ ${source.name}: ${error.message}`);
  }

  result.duration = Date.now() - startTime;
  return result;
}

/**
 * 过滤和去重
 * @param {Array} items 原始内容列表
 * @returns {Array} 过滤后的列表
 */
function filterAndDeduplicate(items) {
  const seen = new Set();
  
  return items.filter((item) => {
    // 基础验证
    if (!item.title || !item.sourceUrl) return false;
    
    // 标题去重
    const key = item.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    
    // 时间过滤（只保留 7 天内）- 仅对主资讯层应用
    if (item.layer === 'primary') {
      const pubDate = new Date(item.publishedAt);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (pubDate < sevenDaysAgo) return false;
    }
    
    return true;
  });
}

/**
 * 保存抓取结果
 * @param {Object} results 抓取结果
 * @param {string} outputDir 输出目录
 */
async function saveResults(results, outputDir) {
  await fs.mkdir(outputDir, { recursive: true });
  
  // 保存带时间戳的版本
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const timestampPath = path.join(outputDir, `fetch-${timestamp}.json`);
  await fs.writeFile(timestampPath, JSON.stringify(results, null, 2), 'utf-8');
  
  // 保存 latest 版本（固定文件名，供下游使用）
  const latestPath = path.join(outputDir, 'fetch-latest.json');
  await fs.writeFile(latestPath, JSON.stringify(results, null, 2), 'utf-8');
  
  return { timestampPath, latestPath };
}

// ============ 主函数 ============

async function main() {
  console.log('🚀 AI Daily Report - 新闻抓取脚本\n');
  
  const startTime = Date.now();
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const sourceFilter = args
    .find(arg => arg.startsWith('--source='))
    ?.split('=')[1];

  // 确定输出目录
  const outputDir = path.join(__dirname, '..', 'data', 'raw');

  // 收集所有抓取任务
  const tasks = [];

  // RSS 主资讯源
  if (!sourceFilter || sourceFilter === 'rss' || sourceFilter === 'primary') {
    const enabledRssSources = RSS_SOURCES.filter(s => s.enabled);
    for (const source of enabledRssSources) {
      tasks.push(await fetchRssSource(source));
      await delay(1000);
    }
  }

  // 社区热议源
  if (!sourceFilter || sourceFilter === 'community') {
    const enabledCommunitySources = COMMUNITY_SOURCES.filter(s => s.enabled);
    for (const source of enabledCommunitySources) {
      tasks.push(await fetchRssSource(source));
      await delay(2000); // Reddit 需要更长的延迟
    }
  }

  // API 源
  if (!sourceFilter || sourceFilter === 'api') {
    const enabledApiSources = API_SOURCES.filter(s => s.enabled);
    for (const source of enabledApiSources) {
      tasks.push(await fetchApiSource(source));
      await delay(1000);
    }
  }

  if (tasks.length === 0) {
    console.log('⚠️  没有启用的数据源');
    process.exit(0);
  }

  // 分离主资讯层和社区层
  const primarySources = tasks.filter(t => t.layer === 'primary' || !t.layer);
  const communitySources = tasks.filter(t => t.layer === 'community');

  // 汇总结果
  const successCount = tasks.filter(r => r.success).length;
  const failCount = tasks.filter(r => !r.success).length;
  const totalItems = tasks.reduce((sum, r) => sum + (r.items?.length || 0), 0);

  // 提取所有内容并去重
  const allPrimaryItems = primarySources
    .filter(r => r.success)
    .flatMap(r => r.items || []);
  const uniquePrimaryItems = filterAndDeduplicate(allPrimaryItems);

  const allCommunityItems = communitySources
    .filter(r => r.success)
    .flatMap(r => r.items || []);
  const uniqueCommunityItems = filterAndDeduplicate(allCommunityItems);

  const finalResult = {
    meta: {
      fetchedAt: new Date().toISOString(),
      totalSources: tasks.length,
      successSources: successCount,
      failedSources: failCount,
      totalItems,
      uniqueItems: uniquePrimaryItems.length + uniqueCommunityItems.length,
      layers: {
        primary: {
          sources: primarySources.length,
          items: uniquePrimaryItems.length,
        },
        community: {
          sources: communitySources.length,
          items: uniqueCommunityItems.length,
        },
      },
    },
    sources: tasks,
    items: uniquePrimaryItems,
    communityPulse: uniqueCommunityItems.slice(0, 20), // 社区热议前 20 条
  };

  // 输出统计
  console.log('\n========== 抓取统计 ==========');
  console.log(`成功源: ${successCount}/${tasks.length}`);
  console.log(`失败源: ${failCount}/${tasks.length}`);
  console.log(`主资讯层: ${uniquePrimaryItems.length} 条`);
  console.log(`社区层: ${uniqueCommunityItems.length} 条`);
  console.log(`耗时: ${Date.now() - startTime}ms`);

  // 保存结果
  if (!isDryRun) {
    const { timestampPath, latestPath } = await saveResults(finalResult, outputDir);
    console.log(`\n💾 结果已保存:`);
    console.log(`   时间戳版本: ${timestampPath}`);
    console.log(`   最新版本: ${latestPath}`);
    console.log('\n   下一步运行: node scripts/generate-report.js');
  } else {
    console.log('\n🏃 Dry run 模式，未保存文件');
  }

  // 返回给调用者（如果是被 import）
  return finalResult;
}

// 运行主函数
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     import.meta.url.endsWith(process.argv[1].replace('./', '/'));

if (isMainModule) {
  main().catch(error => {
    console.error('💥 致命错误:', error);
    process.exit(1);
  });
}

// 导出供其他模块使用
export {
  fetchRssSource,
  fetchApiSource,
  filterAndDeduplicate,
  extractImageUrl,
  fetchOGImage,
  RSS_SOURCES,
  COMMUNITY_SOURCES,
  API_SOURCES,
};
