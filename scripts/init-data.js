#!/usr/bin/env node
/**
 * 初始化数据目录结构
 */
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
const rawDir = path.join(dataDir, 'raw');
const reportsDir = path.join(dataDir, 'reports');

await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(reportsDir, { recursive: true });

console.log('✅ 数据目录已初始化');
console.log(`   raw: ${rawDir}`);
console.log(`   reports: ${reportsDir}`);
