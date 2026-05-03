# Changelog

## v1.1.0 — 2026-05-03

Reading 模塊合入主線 + P2 清理。

### 新增

- Reading 模塊 — 文檔導入/管理/閱讀（.md/.tex/.txt）
  - 集合管理：創建/刪除/排序/展開
  - 文檔導入：文件選擇 + 預覽 + 集合分配
  - 全屏閱讀器：TOC 導航、滾動進度記憶、自動隱藏頂欄
  - 高亮劃線：選中文字保存高亮，側欄管理
  - 書籤：保存閱讀位置，一鍵跳轉
  - 閱讀統計：閱讀時長、完成數、連續天數
  - 全文搜索（300ms debounce）
  - 閱讀設置：字號/行距/邊距即時調整
- Home 第三 tab：「閱讀 · READING」
- `ReadingHomeBody` 共享組件（消除 ReadingHome / ReadingHomeContent 重複）
- `PencilIcon`、`BookmarkIcon` 圖標
- `useReadingHome` hook — 閱讀模塊 state + logic 集中管理

### 清理

- 移除 `typescript` devDependency（僅 capacitor config 使用）— `capacitor.config.ts` → `.js`
- 移除 `mergeQuestionFiles`、`validateQuestion` export（quiz/lib/questionParser.js，無調用者）
- 移除 `getQuestionProgress`、`resetProgress` export（quiz/lib/storage.js，無調用者）
- 刪除死 CSS `.cta-done`、`.line-clamp-3`
- 移除 Import 頁「题库制备指南 · 即将推出」禁用按鈕

### 修復

- 高亮 snippet 從 DOM textContent 提取（原用原始 markdown 定位不準）
- 文件導入失敗時給出 alert（原靜默吞掉錯誤）

## v1.0.0 — 2026-05-03

正式发行版。全量 OCR 题库流水线 + 时间线修复 + 全面 audit + UI 精炼。

### 修复

- `Review.jsx` — `card.deckName` 永远 undefined，顶栏永远显示「复习」→ 改用 `getDeck(id)` 查询真实卡组名
- `DeckDetail.jsx` — 预览弹窗渲染原始 markdown 文本 → 新增 `PreviewContent` 组件，正确渲染 markdown + KaTeX
- `Review.jsx` — 触控滑动直接评分不翻面 → 改为首次滑动翻面，二次滑动才评分（对齐 Browse 行为）
- `ReviewCard.jsx` — `flipped` 状态从组件内提升至 Review.jsx，支持键盘快捷键
- `QuizHomeContent.jsx` — 图表周统计修正：`last_attempt` 秒 vs 毫秒比较永远 false + `new Date(ts)` 日期落在 1970 年
- `QuizPage.jsx` / `QuizReview.jsx` — 点「错题回顾」后 mode chip 未同步出现视觉伪装
- `Browse.jsx` — 翻面后 dangerouslySetInnerHTML 用 `frontHtml` 而非 `backHtml`，答案不显示
- `HeroSection.jsx` — `HeroChart` prop 名 `maxCount` vs `chartMax` 不匹配，chartMax 静默忽略
- `QuizReview.jsx` — `type` 过滤在 `limit` 之后，前 20 题全是选择题时解答题列表为空
- `renderMarkdown.js` — `marked.parse` 无 try-catch，极端输入会崩溃
- `storage.js` — 多处 `localStorage.quot` 无捕捉，满 5MB 静默失败
- `CardEditor.jsx` — `onSave` 无 guard，缺 prop 时 TypeError
- `Search.jsx` — 每 keystroke 即时搜全部数据，无 debounce
- `FlashcardHomeContent.jsx` — `computeStreak()` 每次 render 读全部 localStorage
- `useBackButton.js` — PARENT_MAP 缺 `/wrong`、`/starred`、`/search`，返回永远到首页
- `reviewLog.js` — `getDailyStats` 用 `toISOString().slice(0,10)` 而非 local date
- `index.css` — `.hero-bar` flex 布局反了导致 day label 漂浮在 bar 上方

### 新增

- `Review.jsx` — 键盘快捷键：Space/Enter 翻面，← Again，→ Good（对齐 Browse.jsx）
- `FlashcardHomeContent.jsx` — 空状态增加中文标语「记忆是一切的开端」（对齐旧原型）
- `HeroSection.jsx` — 共享 Dashboard hero 组件，两个 tab 数据驱动渲染
- `ErrorBoundary.jsx` — 全局渲染错误拦截，防止白屏崩溃
- `ocr-cleaner` skill — 5-phase OCR 题库清洗流水线（Phase 1-5）
- `build-apk` skill — `~/Scripts/build-mnemos-apk` 一键构建 APK
- `mnemos-prototype.html` — 14 屏设计原型（stage shell + phone frames + dark mode toggle）
- `mnemos-v1.0.0.apk` — Android debug APK
- 王道数据结构全量题库 — `questions.json` 777 题（8 章，choice 616 + review 161）
- SM-2 undo — Ctrl+Z / Cmd+Z 撤销上一步评分
- Undo toast — 评分后 3 秒撤销提示

### 清理

- `SetDetail.jsx` — 删除未使用的 `useEffect` import、`EditIcon` import、`progressTick` state
- `ReviewCard.jsx` — 删除未使用的 `useState` import
- `Review.jsx` — 移除 swipe handler（`touchStartX` ref + `onTouchStart/End`），rating 仅用按钮
- `ReviewCard.jsx` — 移除重复 star 按钮（topbar 已有）
- `FlashcardHomeContent.jsx` — 删除未使用的 `exitEdit`、`CheckIcon`
- `QuizHomeContent.jsx` — 删除未使用的 `PlusIcon`、`getChapterList`
- `quizEngine.js` — 删除重复 `shuffleArray`（改用 `utils.js shuffle`）、移除 `isDueForReview` 导出
- `reviewLog.js` — 移除未使用的 `getReviewEntries`、`getCardHistory`、`getDailyStats`
- `index.css` — 移除未使用的 `.star-btn`、`.badge-dot`、`.rate-flip` 类
- `scheduler.js` — 移除重复的 pin sort（FlashcardHomeContent 已有）
- `design/` — 删除旧设计文档（`LLM_PROMPT_TEMPLATE.md`、`MIMO_TASK_*.md`、`anki-v1.html`）
- `src/pages/ImportPage.jsx` — 重命名为 `Import.jsx`
- `src/components/StatsBar.jsx` — 删除未使用的组件
- `issues.md` — 所有 issue 已修复，清空为完成状态

### CSS

- `.qa-opt:disabled` — 禁用态鼠标样式改为 default
- `.hero-bar` — `justify-content: flex-end` + margin-top: auto → 改用 absolute 定位，day label 固定在底部
- `.hero-chart` — flex → `display: grid; grid-template-columns: repeat(7, 1fr)`，等宽 7 栏
- `.hero-head-right` — 新增容器，streak/star 群组收拢
- `.qa-opt.* .qa-mark` — `background: #fff` → `var(--bg-card)`（dark mode 适配）
- `.body` — padding 28px 8px 24px，左对齐，align-items: stretch
- `.front-q` — 移除 overflow-y: auto，字号 22→20px
- `.back-a` — 字号 16→15px

### 文字精炼

- 全部 `confirm()` / `alert()` 对话框 → 中文
- CardEditor 按钮 Save/Add → 保存/添加
- 各页按钮统一：返回主页→返回首页、提交答案→提交、再来一组→继续练习、错题回顾→错题重练
- Rate 按钮：未答出→未掌握
- 空状态统一：暂无X 格式
- Section labels 统一 `中文 · ENGLISH` 双语格式
