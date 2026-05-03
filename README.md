# Mnemos

間隔重複記憶 + 題庫練習 + 閱讀。SM-2 算法驅動閃卡複習，支持選擇題/解答題練習，內建 markdown 文檔閱讀器。

## 技術棧

React 18 · Vite 6 · Tailwind 3 · Capacitor 8 · marked + KaTeX + DOMPurify

## 三個模塊

| 模塊 | 入口 | 功能 |
|------|------|------|
| 記憶 | Home tab 1 | SM-2 閃卡複習、卡組管理、撤銷 |
| 練習 | Home tab 2 | 選擇題/解答題、錯題本、收藏 |
| 閱讀 | Home tab 3 | 文檔導入/管理/全屏閱讀、高亮、書籤 |

## 開發

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
```

## 打包 APK

```bash
~/Scripts/build-mnemos-apk
# → android/app/build/outputs/apk/debug/app-debug.apk
```

## 項目結構

```
src/
  lib/               flashcard 核心（storage, sm2, scheduler, renderMarkdown...）
  quiz/lib/          quiz 核心（quizEngine, storage, questionParser）
  reading/lib/       reading 核心（storage, renderDoc, highlights, bookmarks, stats）
  pages/             UI 頁面（Home, DeckDetail, Review, Browse, Import, Settings...）
  components/        共享組件（ReviewCard, CardEditor, HeroSection, ErrorBoundary, Icons）
  styles/            index.css（OKLCH 設計系統）+ markdown.css
```

## 數據存儲

| Namespace | Keys | 用途 |
|-----------|------|------|
| `mnemos-*` | data, daily-limit, review-log, theme, home-tab | flashcard + UI |
| `examprep-*` | questions, progress, starred, last-session | quiz |
| `reading-*` | collections, documents, highlights, bookmarks, stats, settings | reading |

## 導入格式

- **閃卡**：結構化 markdown（`# 科目 ## 章節 - 正面 縮進背面`）
- **題庫**：`questions.json`（choice + review 題型）
- **閱讀**：`.md` / `.tex` / `.txt`
