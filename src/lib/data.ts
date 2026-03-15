/**
 * AI Daily Report - 数据处理工具函数
 */

import fs from 'node:fs';
import path from 'node:path';
import type { DailyReport, ReportCard, CommunityItem } from '../types/report';

export const EMPTY_DAILY_REPORT: DailyReport = {
  version: '1.0',
  meta: {
    date: new Date().toISOString().split('T')[0],
    edition: 'AI-Daily-Empty',
    generatedAt: new Date().toISOString(),
    totalCount: 0,
    tagStats: {
      model: 0,
      product: 0,
      research: 0,
      industry: 0,
      tool: 0,
      policy: 0,
      event: 0,
      funding: 0,
    },
    editorNote: '暂无今日数据，请稍后刷新或联系管理员。',
  },
  items: [],
  sourceStats: [],
  communityPulse: [],
  communityStats: [],
};

export function loadLatestReport(): DailyReport {
  try {
    const latestPath = path.join(process.cwd(), 'data', 'reports', 'latest.json');
    
    if (!fs.existsSync(latestPath)) {
      return EMPTY_DAILY_REPORT;
    }

    const content = fs.readFileSync(latestPath, 'utf-8');
    const data = JSON.parse(content) as DailyReport;

    if (!data || typeof data !== 'object') {
      return EMPTY_DAILY_REPORT;
    }

    if (!Array.isArray(data.items)) {
      data.items = [];
    }

    if (!data.meta) {
      data.meta = EMPTY_DAILY_REPORT.meta;
    }

    return data;
  } catch {
    return EMPTY_DAILY_REPORT;
  }
}

export const tagLabels: Record<string, string> = {
  model: '模型',
  product: '产品',
  research: '研究',
  industry: '行业',
  tool: '工具',
  policy: '政策',
};

export const tagIcons: Record<string, string> = {
  model: '⚡',
  product: '✦',
  research: '◈',
  industry: '◉',
  tool: '⚙',
  policy: '◆',
};

export const heroStatusLabels: Record<string, string> = {
  model: 'model signals',
  product: 'product launches',
  research: 'research drops',
  industry: 'industry moves',
  tool: 'tool updates',
  policy: 'policy shifts',
};

export function formatDisplayDate(dateStr: string): string {
  return new Date(dateStr || Date.now()).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr || Date.now()).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  });
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr || Date.now()).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function sortByHotScore<T extends { hotScore?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.hotScore || 0) - (a.hotScore || 0));
}

export function getTopTagSignals(tagStats: Record<string, number>) {
  return Object.entries(tagStats || {})
    .filter(([, count]) => count > 0)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 3)
    .map(([tag, count]) => ({
      tag,
      count,
      label: tagLabels[tag] || tag,
    }));
}

export function getSweepCategories(sortedItems: ReportCard[], tagStats: Record<string, number>) {
  return (['model', 'product', 'research', 'industry', 'tool', 'policy'] as const)
    .map((tag) => {
      const categoryItems = sortedItems.filter(item => item.tags?.includes(tag)).slice(0, 9);
      return {
        key: tag,
        label: tagLabels[tag] || tag,
        icon: tagIcons[tag] || '◆',
        count: tagStats?.[tag] || categoryItems.length,
        items: categoryItems,
      };
    })
    .filter(category => category.count > 0 && category.items.length > 0);
}

export function generateHeroStatusSummary(
  topTagSignals: { tag: string; count: number }[],
  totalCount: number,
  sourceCount: number,
  generatedTime: string
): string {
  if (topTagSignals.length > 0) {
    return topTagSignals
      .map(({ tag, count }) => `${count} ${heroStatusLabels[tag] || `${tag} signals`}`)
      .join(' / ');
  }
  return `${totalCount} signals / ${sourceCount} sources / updated ${generatedTime}`;
}
