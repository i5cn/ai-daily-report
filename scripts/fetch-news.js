#!/usr/bin/env node

/**
 * AI Daily Report - 新闻抓取脚本
 * 
 * 功能：从白名单 RSS 源和 API 抓取 AI 相关新闻
 * 输出：原始内容数据（JSON 格式），供 generate-report.js 处理
 * 
 * 使用方法：
 *   node scripts/fetch-news.js              # 抓取所有启用源
 *   node scripts/fetch-news.js --source=rss # 仅抓取 RSS 源
 *   node scripts/fetch-news.js --dry-run    # 模拟运行，不保存
 */

const fs = require('fs').promises;
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

// ============ 配置区域 ============

/**
 * 白名单 RSS 源配置
 * 仅从此列表中的源抓取内容
 */
const RSS_SOURCES = [
  {
    id: 'mit-news',
    name: 'MIT News',
    url: 'https://news.mit.edu/rss/topic/artificial-intelligence2',
    homepage: 'https://news.mit.edu',
    defaultTags: ['research'],
    interval: 60, // 分钟
    enabled: true,
  },
  {
    id: 'google-ai-blog',
    name: 'Google AI Blog',
    url: 'https://ai.googleblog.com/feeds/posts/default',
    homepage: 'https://ai.googleblog.com',
    defaultTags: ['model', 'research'],
    interval: 60,
    enabled: true,
  },
  {
    id: 'openai-blog',
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss.xml',
    homepage: 'https://openai.com',
    defaultTags: ['model', 'product'],
    interval: 30,
    enabled: true,
  },
  {
    id: 'anthropic-news',
    name: 'Anthropic News',
    url: 'https://www.anthropic.com/news/rss.xml',
    homepage: 'https://www.anthropic.com',
    defaultTags: ['model', 'research'],
    interval: 60,
    enabled: true,
  },
  {
    id: 'huggingface-blog',
    name: 'Hugging Face Blog',
    url: 'https://huggingface.co/blog/feed.xml',
    homepage: 'https://huggingface.co',
    defaultTags: ['tool', 'model'],
    interval: 120,
    enabled: true,
  },
];

/**
 * API 源配置
 */
const API_SOURCES = [
  {
    id: 'github-trending',
    name: 'GitHub Trending AI',
    // 这是一个示例，实际需要 Trending API 或爬虫
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
  };

  try {
    console.log(`📡 Fetching RSS: ${source.name} ...`);
    
    // 设置请求头，模拟浏览器
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'AI-Daily-Report/1.0 (Bot; Contact: admin@example.com)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      // 30 秒超时
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
    result.items = items.map((item, index) => {
      const title = item.title || 'Untitled';
      const link = item.link?.['#text'] || item.link || item.guid || '';
      const content = item['content:encoded'] || item.description || item.content || '';
      const pubDate = item.pubDate || item.published || item.updated || '';
      
      // 尝试提取图片
      let imageUrl = null;
      const mediaContent = item['media:content'];
      if (mediaContent && mediaContent['@_url']) {
        imageUrl = mediaContent['@_url'];
      }

      return {
        title: extractText(title),
        summary: generateSummary(content),
        source: source.name,
        sourceUrl: typeof link === 'string' ? link : link.toString(),
        publishedAt: parseDate(pubDate),
        imageUrl,
        tags: [...source.defaultTags],
        sourceType: 'rss',
      };
    });

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
    
    // 根据具体 API 格式解析（这里是通用示例）
    // 实际实现需要根据每个 API 的响应结构调整
    const rawItems = Array.isArray(data) ? data : data.items || data.results || [];

    result.items = rawItems.slice(0, 10).map((item) => ({
      title: item.title || item.name || 'Untitled',
      summary: generateSummary(item.description || item.summary || ''),
      source: source.name,
      sourceUrl: item.url || item.html_url || item.link || '',
      publishedAt: parseDate(item.published_at || item.created_at || item.date),
      imageUrl: item.image || item.imageUrl || null,
      tags: [...source.defaultTags],
      sourceType: 'api',
    }));

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
    
    // 时间过滤（只保留 7 天内）
    const pubDate = new Date(item.publishedAt);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (pubDate < sevenDaysAgo) return false;
    
    return true;
  });
}

/**
 * 保存抓取结果
 * @param {Object} results 抓取结果
 * @param {string} outputDir 输出目录
 */
async function saveResults(results, outputDir) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join(outputDir, `fetch-${timestamp}.json`);
  
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  
  return outputPath;
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

  // RSS 源
  if (!sourceFilter || sourceFilter === 'rss') {
    const enabledRssSources = RSS_SOURCES.filter(s => s.enabled);
    tasks.push(...enabledRssSources.map(s => fetchRssSource(s)));
  }

  // API 源
  if (!sourceFilter || sourceFilter === 'api') {
    const enabledApiSources = API_SOURCES.filter(s => s.enabled);
    tasks.push(...enabledApiSources.map(s => fetchApiSource(s)));
  }

  if (tasks.length === 0) {
    console.log('⚠️  没有启用的数据源');
    process.exit(0);
  }

  // 并行执行抓取
  console.log(`开始抓取 ${tasks.length} 个数据源...\n`);
  const results = await Promise.all(tasks);

  // 汇总结果
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const totalItems = results.reduce((sum, r) => sum + (r.items?.length || 0), 0);

  // 提取所有内容并去重
  const allItems = results
    .filter(r => r.success)
    .flatMap(r => r.items || []);
  const uniqueItems = filterAndDeduplicate(allItems);

  const finalResult = {
    meta: {
      fetchedAt: new Date().toISOString(),
      totalSources: tasks.length,
      successSources: successCount,
      failedSources: failCount,
      totalItems,
      uniqueItems: uniqueItems.length,
    },
    sources: results,
    items: uniqueItems,
  };

  // 输出统计
  console.log('\n========== 抓取统计 ==========');
  console.log(`成功源: ${successCount}/${tasks.length}`);
  console.log(`失败源: ${failCount}/${tasks.length}`);
  console.log(`原始条目: ${totalItems}`);
  console.log(`去重后: ${uniqueItems.length}`);
  console.log(`耗时: ${Date.now() - startTime}ms`);

  // 保存结果
  if (!isDryRun) {
    const outputPath = await saveResults(finalResult, outputDir);
    console.log(`\n💾 结果已保存: ${outputPath}`);
    console.log('   下一步运行: node scripts/generate-report.js');
  } else {
    console.log('\n🏃 Dry run 模式，未保存文件');
  }

  // 返回给调用者（如果是被 import）
  return finalResult;
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('💥 致命错误:', error);
    process.exit(1);
  });
}

// 导出供其他模块使用
module.exports = {
  fetchRssSource,
  fetchApiSource,
  filterAndDeduplicate,
  RSS_SOURCES,
  API_SOURCES,
};
