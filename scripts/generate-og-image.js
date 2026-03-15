#!/usr/bin/env node

/**
 * AI Daily Report - OG 图片生成脚本
 * 
 * 生成 Open Graph 图片用于社交媒体分享
 * 输出: public/og-image.png
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const WIDTH = 1200;
const HEIGHT = 630;
const BG_COLOR = '#030714';
const ACCENT_COLOR = '#ff5d5d';
const TEXT_COLOR = '#f3f6ff';

function generateOGImage() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 渐变光晕效果
  const gradient1 = ctx.createRadialGradient(300, 200, 0, 300, 200, 400);
  gradient1.addColorStop(0, 'rgba(255, 93, 93, 0.3)');
  gradient1.addColorStop(1, 'rgba(255, 93, 93, 0)');
  ctx.fillStyle = gradient1;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const gradient2 = ctx.createRadialGradient(900, 300, 0, 900, 300, 300);
  gradient2.addColorStop(0, 'rgba(35, 215, 255, 0.2)');
  gradient2.addColorStop(1, 'rgba(35, 215, 255, 0)');
  ctx.fillStyle = gradient2;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 品牌标记（圆形发光）
  ctx.beginPath();
  ctx.arc(600, 200, 60, 0, Math.PI * 2);
  ctx.fillStyle = ACCENT_COLOR;
  ctx.shadowColor = ACCENT_COLOR;
  ctx.shadowBlur = 40;
  ctx.fill();
  ctx.shadowBlur = 0;

  // 标题
  ctx.font = '800 72px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_COLOR;
  ctx.textAlign = 'center';
  ctx.fillText('AI Signal Surface', 600, 350);

  // 副标题
  ctx.font = '500 28px "Manrope", sans-serif';
  ctx.fillStyle = 'rgba(186, 196, 218, 0.9)';
  ctx.fillText('每日 AI 资讯聚合 · The AI feed that actually matters', 600, 410);

  // 底部标签
  ctx.font = '600 18px "IBM Plex Mono", monospace';
  ctx.fillStyle = ACCENT_COLOR;
  ctx.fillText('i5cn.github.io/ai-daily-report', 600, 550);

  // 保存
  const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log('✅ OG 图片已生成:', outputPath);
}

// 检查是否安装了 canvas
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    generateOGImage();
  } catch (error) {
    console.error('❌ 生成 OG 图片失败:', error.message);
    console.log('💡 提示: 安装 canvas 依赖后重试: npm install canvas');
    process.exit(1);
  }
}

export { generateOGImage };
