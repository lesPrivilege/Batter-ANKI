#!/usr/bin/env node
// Generate public/setup-reading.html with embedded document contents
// Reads source files, produces a one-shot setup page served by Vite dev server

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const FILES = [
  {
    src: resolve(process.env.HOME, 'Documents/Obsidian/reading-notes/2025-01-31_arxiv_imitation-game-for-adversarial-disillusion-with-ch.md'),
    collection: 'Arxiv',
    collectionIcon: '📄',
    title: 'Imitation Game for Adversarial Disillusion with CoT Reasoning',
  },
  {
    src: resolve(process.env.HOME, 'Reading/01_economist/TheEconomist.2025.01.18.md'),
    collection: 'The Economist',
    collectionIcon: '📰',
    title: 'The Economist — 2025.01.18',
  },
]

const docs = []
for (const f of FILES) {
  const content = readFileSync(f.src, 'utf8')
  docs.push({ ...f, content })
  console.log(`  read ${f.src.split('/').pop()} (${(content.length / 1024).toFixed(0)} KB)`)
}

const docsJson = JSON.stringify(docs.map(d => ({
  collection: d.collection,
  collectionIcon: d.collectionIcon,
  title: d.title,
  content: d.content,
})))

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>Mnemos Reading Setup</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: system-ui; max-width: 480px; margin: 40px auto; padding: 20px; background: #faf8f5; }
  h2 { font-weight: 500; } .ok { color: #16a34a; } .err { color: #dc2626; }
  .item { padding: 8px 0; border-bottom: 1px solid #e5e5e5; }
  a { color: #b45309; }
</style></head>
<body>
<h2>Mnemos · 导入阅读文档</h2>
<div id="log"></div>
<script>
const DOCS = ${docsJson};

function setup() {
  const log = document.getElementById('log');

  // Load or create collections
  const colsKey = 'reading-collections';
  let cols = [];
  try { cols = JSON.parse(localStorage.getItem(colsKey) || '[]'); } catch(e) {}

  const colMap = {};
  for (const d of DOCS) {
    let col = cols.find(c => c.name === d.collection);
    if (!col) {
      col = { id: crypto.randomUUID(), name: d.collection, icon: d.collectionIcon, order: cols.length, createdAt: new Date().toISOString() };
      cols.push(col);
    }
    colMap[d.collection] = col;
  }
  localStorage.setItem(colsKey, JSON.stringify(cols));

  // Load or create documents
  const docsKey = 'reading-documents';
  let docs = [];
  try { docs = JSON.parse(localStorage.getItem(docsKey) || '[]'); } catch(e) {}

  for (const d of DOCS) {
    const col = colMap[d.collection];
    docs.push({
      id: crypto.randomUUID(),
      collectionId: col.id,
      title: d.title,
      content: d.content,
      format: 'md',
      createdAt: new Date().toISOString(),
      lastReadAt: null,
      scrollPct: 0,
    });
  }
  localStorage.setItem(docsKey, JSON.stringify(docs));

  for (const d of DOCS) {
    const el = document.createElement('div'); el.className = 'item ok';
    el.textContent = '✓ ' + d.collection + '  ·  ' + d.title;
    log.appendChild(el);
  }
  const done = document.createElement('p'); done.className = 'ok';
  done.innerHTML = '✅ 导入完成 — <a href="/">打开 Mnemos</a> → 阅读 tab';
  log.appendChild(done);
}

try { setup(); } catch(e) {
  const el = document.createElement('p'); el.className = 'err';
  el.textContent = '导入失败: ' + e.message; log.appendChild(el);
}
</script>
</body></html>`

const out = resolve('public/setup-reading.html')
writeFileSync(out, html)
console.log(`  wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`)
