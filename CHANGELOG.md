# Changelog

## v0.7.0 — 2026-05-01 (star, stats, rename, dedup)

**新增：**
- 卡片收藏功能（☆/★ 标记 + DeckDetail 筛选）
- 复习结果统计（正确率 + 评分分布）
- Deck 重命名（header 点击编辑）
- 导入去重检测（front 匹配，跳过/全部导入选项）

---

## v0.6.2 — 2026-05-01 (improvements)

**改进：**
- .md 导入自动提取 h1 标题作为 deck name（可手动修改）
- Review/Browse 界面显示章节标签（chapter > section）

---

## v0.6.1 — 2026-05-01 (fixes)

**修复：**
- 修复首页点击卡组无法进入 DeckDetail 的 regression
- 按钮可见性：Review 按钮加 border，Confirm 按钮改实心背景
- 置顶标记从 📌 emoji 改为 ▲ 纯文字

---

## v0.5.1 — 2026-05-01 (navigation + quick review)

**改动：**
- 全部子页面返回按钮统一为 navigate(-1)（Review, Browse, PromptGuide, ImportPage）
- 首页 deck 卡片加快捷 Review 按钮（dueCount > 0 时显示）

---

## v0.9.1 — 2026-05-01 (fixes + review all)

**修复：**
- 修复 Unicode 箭头未渲染问题（← 显示为转义字符串）
- DeckDetail 移除"制卡指南"按钮
- PromptGuide / ImportPage 返回按钮改为 navigate(-1)，从 Import 进来回 Import

**新增：**
- DeckDetail 加 "Review All" 按钮，支持复习全部卡片（不限 dueDate）

---

## v0.9.0 — 2026-05-01 (import page)

**改动：**
- 新增 ImportPage.jsx（/import），整合文件导入和粘贴导入为独立页面
- Home.jsx 简化为 Import + New Deck 两个按钮
- 移除首页的 Paste 展开逻辑
- 语言规范：按钮英文、提示中文、placeholder 英文

---

## v0.8.2 — 2026-05-01 (ux cleanup)

**改动：**
- Home.jsx：底部按钮简化为 Import / Paste / + New Deck（无副标题）
- Import：解析 0 张卡时提示并跳转制卡指南
- Paste：文本框上方加格式说明链接到制卡指南
- 移除首页的 "如何制作 .md？" 链接

---

## v0.8.1 — 2026-05-01 (fixes)

**修复：**
- .md 导入：修复文件扩展名判断逻辑
- 制卡指南链接：改为 react-router Link 组件

---

## v0.8.0 — 2026-05-01 (security + bug fixes)

**安全修复：**
- renderMarkdown.js 添加 DOMPurify sanitize，防止 HTML 注入

**Bug 修复：**
- 统一使用本地日期（dateUtils.js）替代 UTC toISOString，修复午夜前后日期偏移
- Home.jsx reviewedToday 统计改为正确逻辑（基于 updatedAt + repetitions）

---

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

## v0.6.0 — 2026-05-01 (shuffle, pin, preview, search)

**新增：**
- 卡片打乱顺序（Fisher-Yates shuffle，Review + Browse）
- 卡组置顶功能（storage.js pinned 字段 + togglePin）
- 导入预览（解析后展示卡片列表，确认再写入）
- 卡片搜索（DeckDetail 实时过滤，匹配 front/back）

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
