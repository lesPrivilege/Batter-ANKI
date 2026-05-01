# Changelog

## v0.7.3 — 2026-05-01 (fix)

**修复：**
- 移除 ReviewCard.jsx 中重复的评分按钮（仅保留 Review.jsx 中的版本）
- Prompt 模板补充 LaTeX 语法说明（反引号包裹要求）

---

## v0.7.2 — 2026-05-01 (debug APK build)

**构建：**
- Debug APK 构建成功（26MB）
- `npm run build` + `npx cap sync android` + `sed` Java 17 patch + `./gradlew assembleDebug`
- APK 输出：`android/app/build/outputs/apk/debug/app-debug.apk`

**自检：**
- 15 项 checklist 全部通过
- 发现 2 个问题记录于 issues.md（Review 重复评分按钮、KaTeX 行内公式需反引号包裹）

---

## v0.7.1 — 2026-05-01 (home simplification)

**改动：**
- Home.jsx：合并 Import + Import .md 为一个按钮，支持 .json/.md 自动识别
- Home.jsx：移除 Export 按钮（后续进 Settings）
- Home.jsx：底部简化为 Import / Paste .md / + New Deck 三个按钮
- Import 按钮下方加"如何制作 .md？"链接到制卡指南

---

## v0.7.0 — 2026-05-01 (prompt guide)

**新增：** 制卡指南页面（/prompt-guide），内置 prompt 模板一键复制

**改动：**
- App 名称从 MiniSRS 统一为 Mnemos（capacitor, index.html, package.json, strings.xml）
- 新增 PromptGuide.jsx 页面，含完整 prompt 模板和复制功能
- Home.jsx 和 DeckDetail.jsx 底部加制卡指南入口
- .card-content 中文字体确认使用 Noto Serif SC

---

## v0.6.0 — 2026-05-01 (rename + browse)

**改动：**
- App 名称从 MiniSRS 改为 Mnemos
- 新增 Browse 页面（/browse/:id）：浏览牌组全部卡片，不影响 SM-2 调度
- DeckDetail 新增 Browse 按钮

---

## v0.5.0 — 2026-05-01 (markdown + latex)

**新增：** 卡片正反面支持 Markdown 和 LaTeX 渲染

**改动：**
- `src/lib/renderMarkdown.js`: 新建，marked + KaTeX 集成，支持行内 $...$ 和块级 $$...$$ 公式
- `src/components/ReviewCard.jsx`: 正反面改用 dangerouslySetInnerHTML 渲染
- `src/styles/markdown.css`: 新建，卡片内 markdown 元素样式（code, table, blockquote 等）
- `package.json`: 添加 marked + katex 依赖

---

## v0.4.0 — 2026-05-01 (md import)

**新增：** .md 文件导入，解析结构化 markdown 为卡片

**改动：**
- `src/lib/mdParser.js`: 新建，纯前端确定性解析器，移植 reader.py 分块逻辑，支持 FORMAT.md 体例（h2→chapter, h3→section, `- `→front, 缩进→back，子知识点不单独成卡）
- `src/pages/Home.jsx`: 新增「Import .md」按钮（文件选择器，accept=".md"）和「Paste .md」按钮（textarea 粘贴 markdown 文本），两种输入方式共用同一解析流程

---

## v0.3.1 — 2026-05-01 (build fix)

**修复：**
- cap sync 每次覆盖 VERSION_21，现在 patch node_modules/@capacitor/android/capacitor/build.gradle
- 所有 android/*.gradle 统一 VERSION_17
- APK 体积 4.7MB → 16MB（Noto Serif SC 中文字体打包）

## v0.3.0 — 2026-05-01 (design migration)

**设计迁移：** anki.html → Tailwind 项目

**改动：**
- `index.css`: 色板从蓝灰 (hue 260) 迁移到暖棕 (hue 60)，新增 shadow/radius 变量
- `tailwind.config.js`: 全新 color token 体系 (bg/ink/accent/success/warning/danger)，新增 shadow-card/raised，字体改为 DM Sans + Noto Serif SC
- `main.jsx`: @fontsource 字体从 JetBrains Mono + IBM Plex Sans → DM Sans + Noto Serif SC
- `index.html`: 移除 Google Fonts CDN
- `package.json`: @fontsource/dm-sans + @fontsource/noto-serif-sc 替换旧字体
- 全部组件 Tailwind 类名更新：bg-bg-primary→bg-bg, bg-bg-surface→bg-bg-card, text-text-primary→text-ink, font-body→font-ui, font-display→font-serif 等

---

## v0.2.0 — 2026-05-01 (demo baseline)

**来源：** ANKI.zip（Claude Design 重绘输出）

**覆盖内容：**
- 全部 src/ 组件和页面（Home, DeckDetail, Review, CardEditor, ReviewCard, StatsBar）
- 样式系统（index.css, tailwind.config.js）
- 路由（App.jsx）

**保留的修复（从 v0.1.0）：**
- `App.jsx`: BrowserRouter → HashRouter（Capacitor WebView 兼容）
- `main.jsx`: 添加 @fontsource 字体 imports（离线可用）
- `package.json`: 保留 @capacitor/* 和 @fontsource 依赖
- `android/`: 保留 Capacitor native project + Java 17 兼容 patch

---

## v0.1.0 — 2026-05-01 (initial)

**Commits:**
- `2655094` v1: anki.html design draft + existing React project
- `64dbe95` fix: HashRouter closing tag, self-host fonts via @fontsource, Capacitor appId
- `5d7af48` feat: Capacitor Android setup + TypeScript deps
- `687a56e` feat: debug APK build success (4.7MB), Java 17 compat patch

**功能：**
- React 18 + Vite 6 + Tailwind 3
- SM-2 间隔重复算法
- 3 页面：Home（牌组列表）、DeckDetail（大纲视图）、Review（翻卡复习）
- recall/reference 双卡片类型
- chapter/section 知识结构
- JSON 导入/导出
- 深色模式
- Capacitor Android 打包（debug APK 4.7MB）

**设计规范：** `~/.claude/skills/mini-srs-design/DESIGN.md`（Tech Utility 风格）
