#!/usr/bin/env node

/**
 * AI Daily Report - 日报生成脚本
 * 
 * 功能：将 fetch-news.js 的抓取结果转换为 latest.json 格式
 * 输入：data/raw/fetch-*.json
 * 输出：data/reports/latest.json
 * 
 * 使用方法：
 *   node scripts/generate-report.js              # 使用最新抓取结果
 *   node scripts/generate-report.js --input=xxx  # 指定输入文件
 *   node scripts/generate-report.js --mock       # 使用 mock 数据
 */

const fs = require('fs').promises;
const path = require('path');

// ============ 配置区域 ============

/**
 * 标签权重（用于排序）
 */
const TAG_WEIGHTS = {
  model: 10,     // 大模型发布优先级最高
  product: 9,    // 产品发布
  tool: 8,       // 开发工具
  research: 7,   // 学术研究
  industry: 6,   // 行业动态
  event: 5,      // 活动会议
  policy: 4,     // 政策法规
  funding: 3,    // 投融资
};

/**
 * 精选内容阈值
 */
const FEATURED_CONFIG = {
  maxCount: 3,           // 最多 3 条精选
  minHotScore: 80,       // 热度分门槛
  requireImage: false,   // 是否必须有图片
};

// ============ 工具函数 ============

/**
 * 生成唯一 ID
 */
function generateId(date, index) {
  const dateStr = date.replace(/-/g, '');
  const seq = String(index + 1).padStart(3, '0');
  return `ai-daily-${dateStr}-${seq}`;
}

/**
 * 获取今日日期
 */
function getToday() {
  return new Date().toISOString().split('T')[0];
}

/**
 * 格式化日期为版本号
 */
function formatEdition(date) {
  return `AI-Daily-${date}`;
}

/**
 * 计算内容热度分
 */
function calculateHotScore(item, index) {
  let score = 0;
  
  // 基础分：标签权重
  const maxTagWeight = Math.max(...item.tags.map(t => TAG_WEIGHTS[t] || 0));
  score += maxTagWeight * 5;
  
  // 时效性：越新分数越高
  const hoursAgo = (Date.now() - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60);
  score += Math.max(0, 24 - hoursAgo);
  
  // 内容质量：摘要长度适中加分
  const summaryLength = item.summary?.length || 0;
  if (summaryLength >= 100 && summaryLength <= 300) {
    score += 10;
  }
  
  // 有图片加分
  if (item.imageUrl) {
    score += 5;
  }
  
  return Math.round(score);
}

/**
 * 选择精选内容
 */
function selectFeatured(items, config) {
  // 按热度分排序
  const sorted = [...items].sort((a, b) => b.hotScore - a.hotScore);
  
  // 取前 N 条，且满足热度门槛
  const featured = [];
  for (const item of sorted) {
    if (featured.length >= config.maxCount) break;
    if (item.hotScore < config.minHotScore) continue;
    if (config.requireImage && !item.imageUrl) continue;
    featured.push(item);
  }
  
  return featured;
}

/**
 * 统计标签分布
 */
function calculateTagStats(items) {
  const stats = {
    model: 0, product: 0, research: 0, industry: 0,
    policy: 0, tool: 0, event: 0, funding: 0,
  };
  
  for (const item of items) {
    for (const tag of item.tags) {
      if (stats[tag] !== undefined) {
        stats[tag]++;
      }
    }
  }
  
  return stats;
}

/**
 * 统计来源分布
 */
function calculateSourceStats(items) {
  const sourceMap = new Map();
  
  for (const item of items) {
    const key = item.source;
    if (!sourceMap.has(key)) {
      sourceMap.set(key, {
        name: key,
        count: 0,
        url: item.sourceUrl ? new URL(item.sourceUrl).origin : '',
      });
    }
    sourceMap.get(key).count++;
  }
  
  return Array.from(sourceMap.values()).sort((a, b) => b.count - a.count);
}

// ============ 核心逻辑 ============

/**
 * 处理原始内容为标准格式
 */
function processItems(rawItems, date) {
  return rawItems.map((raw, index) => {
    const item = {
      id: raw.id || generateId(date, index),
      title: raw.title?.trim() || 'Untitled',
      summary: raw.summary?.trim() || '',
      content: raw.content || '',
      source: raw.source?.trim() || 'Unknown',
      sourceUrl: raw.sourceUrl?.trim() || '',
      publishedAt: raw.publishedAt || new Date().toISOString(),
      fetchedAt: raw.fetchedAt || new Date().toISOString(),
      imageUrl: raw.imageUrl || null,
      tags: Array.isArray(raw.tags) ? raw.tags : ['industry'],
      sourceType: raw.sourceType || 'rss',
      hotScore: 0,
      featured: false,
    };
    
    // 计算热度分
    item.hotScore = calculateHotScore(item, index);
    
    return item;
  });
}

/**
 * 生成编辑备注
 */
function generateEditorNote(items, featured) {
  const parts = [];
  
  // 根据内容生成一句话总结
  const modelItems = items.filter(i => i.tags.includes('model'));
  const productItems = items.filter(i => i.tags.includes('product'));
  const toolItems = items.filter(i => i.tags.includes('tool'));
  
  if (modelItems.length > 0) {
    parts.push(`${modelItems.length} 个大模型相关更新`);
  }
  if (productItems.length > 0) {
    parts.push(`${productItems.length} 项产品发布`);
  }
  if (toolItems.length > 0) {
    parts.push(`${toolItems.length} 个开发工具更新`);
  }
  
  if (parts.length === 0) {
    return `今日 AI 领域共有 ${items.length} 条值得关注的内容。`;
  }
  
  return `今日 AI 领域重点关注：${parts.join('、')}。`;
}

/**
 * 构建日报数据结构
 */
function buildReport(rawItems, options = {}) {
  const date = options.date || getToday();
  const generatedAt = new Date().toISOString();
  
  // 处理内容
  let items = processItems(rawItems, date);
  
  // 按时间倒序排序
  items.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  
  // 选择精选内容
  const featured = selectFeatured(items, FEATURED_CONFIG);
  featured.forEach(f => {
    const item = items.find(i => i.id === f.id);
    if (item) item.featured = true;
  });
  
  // 生成元数据
  const tagStats = calculateTagStats(items);
  const sourceStats = calculateSourceStats(items);
  
  const report = {
    version: '1.0',
    meta: {
      date,
      edition: formatEdition(date),
      generatedAt,
      totalCount: items.length,
      tagStats,
      editorNote: options.editorNote || generateEditorNote(items, featured),
    },
    items,
    sourceStats,
  };
  
  return report;
}

/**
 * 查找最新的抓取结果文件
 */
async function findLatestFetch(dataDir) {
  const rawDir = path.join(dataDir, 'raw');
  
  try {
    const files = await fs.readdir(rawDir);
    const fetchFiles = files
      .filter(f => f.startsWith('fetch-') && f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (fetchFiles.length === 0) {
      return null;
    }
    
    return path.join(rawDir, fetchFiles[0]);
  } catch {
    return null;
  }
}

/**
 * 加载抓取结果
 */
async function loadFetchResult(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * 保存日报
 */
async function saveReport(report, outputDir) {
  await fs.mkdir(outputDir, { recursive: true });
  
  const latestPath = path.join(outputDir, 'latest.json');
  const archivePath = path.join(outputDir, `report-${report.meta.date}.json`);
  
  // 保存最新版
  await fs.writeFile(latestPath, JSON.stringify(report, null, 2), 'utf-8');
  
  // 归档
  await fs.writeFile(archivePath, JSON.stringify(report, null, 2), 'utf-8');
  
  return { latestPath, archivePath };
}

// ============ 主函数 ============

async function main() {
  console.log('📰 AI Daily Report - 日报生成脚本\n');
  
  const args = process.argv.slice(2);
  const useMock = args.includes('--mock');
  const inputArg = args.find(arg => arg.startsWith('--input='));
  const customInput = inputArg ? inputArg.split('=')[1] : null;
  
  const dataDir = path.join(__dirname, '..', 'data');
  const reportsDir = path.join(dataDir, 'reports');
  
  let rawItems = [];
  let sourceInfo = 'unknown';
  
  // 获取原始数据
  if (useMock) {
    // 使用 mock 数据
    console.log('🎭 使用 Mock 数据模式');
    rawItems = generateMockData();
    sourceInfo = 'mock';
  } else if (customInput) {
    // 指定输入文件
    const inputPath = path.isAbsolute(customInput) 
      ? customInput 
      : path.join(process.cwd(), customInput);
    console.log(`📂 加载指定文件: ${inputPath}`);
    const fetchResult = await loadFetchResult(inputPath);
    rawItems = fetchResult.items || [];
    sourceInfo = inputPath;
  } else {
    // 自动查找最新抓取结果
    const latestFetch = await findLatestFetch(dataDir);
    if (latestFetch) {
      console.log(`📂 加载抓取结果: ${path.basename(latestFetch)}`);
      const fetchResult = await loadFetchResult(latestFetch);
      rawItems = fetchResult.items || [];
      sourceInfo = latestFetch;
    } else {
      console.log('⚠️  未找到抓取结果，使用 Mock 数据');
      rawItems = generateMockData();
      sourceInfo = 'mock (fallback)';
    }
  }
  
  if (rawItems.length === 0) {
    console.error('❌ 没有内容可生成日报');
    process.exit(1);
  }
  
  console.log(`📝 处理 ${rawItems.length} 条原始内容...\n`);
  
  // 生成日报
  const report = buildReport(rawItems);
  
  // 保存
  const { latestPath, archivePath } = await saveReport(report, reportsDir);
  
  // 输出摘要
  console.log('========== 日报生成完成 ==========');
  console.log(`日期: ${report.meta.date}`);
  console.log(`版号: ${report.meta.edition}`);
  console.log(`内容数: ${report.meta.totalCount}`);
  console.log(`精选数: ${report.items.filter(i => i.featured).length}`);
  console.log(`数据来源: ${sourceInfo}`);
  console.log('\n分类统计:');
  Object.entries(report.meta.tagStats)
    .filter(([, count]) => count > 0)
    .forEach(([tag, count]) => {
      console.log(`  ${tag}: ${count} 条`);
    });
  
  console.log(`\n💾 文件已保存:`);
  console.log(`   最新版: ${latestPath}`);
  console.log(`   归档: ${archivePath}`);
  console.log('\n🎉 日报生成完成！');
  
  return report;
}

/**
 * 生成 Mock 数据（用于测试）
 */
function generateMockData() {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  
  return [
    {
      title: 'OpenAI 发布 GPT-5 预览版',
      summary: 'OpenAI 今日发布 GPT-5 预览版，在多模态理解和代码生成方面实现重大突破。',
      source: 'OpenAI Blog',
      sourceUrl: 'https://openai.com/blog/gpt-5-preview',
      publishedAt: new Date(now - 2 * hour).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
      tags: ['model', 'product'],
      sourceType: 'api',
    },
    {
      title: 'Google DeepMind 开源新框架',
      summary: 'Google DeepMind 开源 JaxLearning 框架，简化分布式强化学习研究。',
      source: 'Google AI Blog',
      sourceUrl: 'https://ai.googleblog.com/jaxlearning',
      publishedAt: new Date(now - 5 * hour).toISOString(),
      tags: ['tool', 'research'],
      sourceType: 'rss',
    },
    {
      title: 'Anthropic 发布 AI 安全研究报告',
      summary: '最新研究探讨了大语言模型的可解释性和对齐问题。',
      source: 'Anthropic',
      sourceUrl: 'https://anthropic.com/research/safety',
      publishedAt: new Date(now - 8 * hour).toISOString(),
      tags: ['research', 'policy'],
      sourceType: 'rss',
    },
    {
      title: 'AI 编程助手 Cursor 获新融资',
      summary: 'AI 编程工具 Cursor 宣布完成 B 轮融资，估值超 10 亿美元。',
      source: 'TechCrunch',
      sourceUrl: 'https://techcrunch.com/cursor-funding',
      publishedAt: new Date(now - 12 * hour).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
      tags: ['funding', 'tool'],
      sourceType: 'manual',
    },
  ];
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
  buildReport,
  processItems,
  calculateHotScore,
  selectFeatured,
  calculateTagStats,
  generateMockData,
};
