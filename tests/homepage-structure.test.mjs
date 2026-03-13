import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const distIndex = path.join(repoRoot, 'dist', 'index.html');

function buildHomepage() {
  execFileSync('npm', ['run', 'build'], {
    cwd: repoRoot,
    stdio: 'ignore',
  });

  return fs.readFileSync(distIndex, 'utf8');
}

test('homepage exposes semantic navigation and avoids broken archive links', () => {
  const html = buildHomepage();

  assert.match(html, /href="#main-content"[^>]*>跳转到主要内容</);
  assert.match(html, /<main[^>]*id="main-content"/);
  assert.match(html, /id="page-top"/);
  assert.match(html, /id="signal-deck"/);
  assert.match(html, /id="top-signals"/);
  assert.match(html, /id="categories"/);
  assert.match(html, /id="community"/);
  assert.match(html, /id="source-ledger"/);
  assert.match(html, /href="#page-top"/);
  assert.doesNotMatch(html, /href="\/archive"/);
});

test('homepage signal deck exposes a summary brief and primary signal panel', () => {
  const html = buildHomepage();

  assert.match(html, /class="hero-brand-mark"/);
  assert.match(html, /AI Signal Surface/);
  assert.match(html, /class="hero-status-pill"/);
  assert.match(html, /class="signal-marquee"/);
  assert.match(html, /class="signal-marquee-track"/);
  assert.match(html, /class="signal-marquee-card"/);
});

test('homepage category cards expose a unified full-card link pattern', () => {
  const html = buildHomepage();

  assert.match(html, /class="report-card-link"/);
  assert.doesNotMatch(html, /class="action-link"/);
});

test('homepage exposes interactive category sweep controls and source ledger metadata', () => {
  const html = buildHomepage();

  assert.match(html, /class="category-sweep-controls"/);
  assert.match(html, /data-category-filter="all"/);
  assert.match(html, /data-category-panel="all"/);
  assert.doesNotMatch(html, /role="tablist"/);
  assert.doesNotMatch(html, /role="tab"/);
  assert.match(html, /class="community-pulse-band"/);
  assert.match(html, /class="source-ledger-grid"/);
});

test('homepage images use meaningful alt text', () => {
  const html = buildHomepage();

  assert.doesNotMatch(html, /<img[^>]*alt=""/);
});
