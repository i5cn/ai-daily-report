#!/usr/bin/env node

/**
 * 测试 Reddit RSS 解析修复
 */

import { XMLParser } from 'fast-xml-parser';

// 模拟修复后的工具函数
function ensureString(value, defaultValue = '') {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'object') {
    if (value['#text']) return String(value['#text']);
    if (value['@_content']) return String(value['@_content']);
    return JSON.stringify(value);
  }
  return String(value);
}

function extractText(html) {
  const str = ensureString(html, '');
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 模拟 Reddit RSS 可能返回的数据结构
const mockRedditItem = {
  title: {
    '#text': '[D] New advances in transformer architectures',
    '@_type': 'html'
  },
  link: 'https://www.reddit.com/r/MachineLearning/comments/abc123/',
  description: '<p>Discussion about the latest transformer improvements</p>',
  pubDate: '2026-03-13T10:00:00Z'
};

// 测试修复后的 extractText
console.log('=== 测试 Reddit RSS 解析修复 ===\n');

console.log('1. 测试 ensureString 函数:');
console.log('   字符串输入:', ensureString('hello') === 'hello' ? '✅ 通过' : '❌ 失败');
console.log('   对象输入:', ensureString({ '#text': 'test' }) === 'test' ? '✅ 通过' : '❌ 失败');
console.log('   null输入:', ensureString(null) === '' ? '✅ 通过' : '❌ 失败');

console.log('\n2. 测试 extractText 函数:');
console.log('   字符串HTML:', extractText('<p>test</p>') === 'test' ? '✅ 通过' : '❌ 失败');
console.log('   对象输入:', extractText({ '#text': '<p>test</p>' }) === 'test' ? '✅ 通过' : '❌ 失败');
console.log('   null输入:', extractText(null) === '' ? '✅ 通过' : '❌ 失败');

console.log('\n3. 模拟 Reddit Item 处理:');
try {
  const titleRaw = mockRedditItem.title; // 这是一个对象
  const title = extractText(titleRaw);
  console.log('   原始title:', JSON.stringify(titleRaw));
  console.log('   处理后title:', title);
  console.log('   结果:', title && title !== 'Untitled' ? '✅ 修复成功' : '❌ 仍有问题');
} catch (error) {
  console.log('   ❌ 错误:', error.message);
}

console.log('\n4. 测试实际抓取 (Reddit RSS):');
async function testRedditFetch() {
  try {
    const response = await fetch('https://www.reddit.com/r/artificial.rss', {
      headers: {
        'User-Agent': 'AI-Daily-Report-Test/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xmlText = await response.text();
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseTagValue: false,
    });
    const parsed = parser.parse(xmlText);

    const entries = parsed.rss?.channel?.item || [];
    const items = Array.isArray(entries) ? entries : [entries].filter(Boolean);

    console.log(`   获取到 ${items.length} 条 Reddit 内容`);
    
    if (items.length > 0) {
      const firstItem = items[0];
      console.log('   第一条内容:');
      console.log('     - title 类型:', typeof firstItem.title);
      console.log('     - title 值:', JSON.stringify(firstItem.title).substring(0, 80));
      
      // 测试修复后的处理
      const title = extractText(firstItem.title);
      console.log('     - 处理后 title:', title.substring(0, 60));
      
      // 测试 content 处理
      const contentRaw = firstItem['content:encoded'] || firstItem.description || '';
      const content = ensureString(contentRaw);
      console.log('     - content 长度:', content.length);
      
      console.log('   ✅ Reddit RSS 解析成功!');
    }
  } catch (error) {
    console.log('   ❌ 抓取失败:', error.message);
  }
}

await testRedditFetch();

console.log('\n=== 测试完成 ===');
