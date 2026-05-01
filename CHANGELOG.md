# Changelog

## v1.0.5 — 2026-05-01 (appId + storage migration)

**改动：**
- appId: `com.lesprivilege.minisrs` → `com.lesprivilege.mnemos`（capacitor.config.ts, build.gradle, strings.xml, MainActivity.java）
- localStorage key: `mini-srs-data` → `mnemos-data`，含一次性自动迁移（旧用户打开新版自动搬数据）
- Java 包路径: `com/lesprivilege/minisrs/` → `com/lesprivilege/mnemos/`

**注意：** appId 变更后需卸载旧版再装新版。

---

## v1.0.4 — 2026-05-01 (splash screen)

**新增：**
- `@capacitor/splash-screen` 插件：启动时显示 #FAF8F5 背景 + M mark 居中
- `scripts/gen-splash.mjs`：splash PNG 生成脚本（11 种密度/方向组合）
- `styles.xml`：Android 12+ SplashScreen API 配置（`windowSplashScreenBackground`）

**修复：**
- `capacitor.build.gradle` Java 兼容性回退 VERSION_21→VERSION_17（splash-screen 库需要）
- 远程仓库改名：`Batter-ANKI` → `Mnemos`

---

## v1.0.3 — 2026-05-01 (card container + click target)

**修复：**
- 卡片容器不显示：将 bg/border/shadow 从 3D flip faces 内移出到外层 wrapper，避免 rotateY stacking context 吞掉背景
- 翻卡点击区域：onClick 移到最外层 card container，整个卡片矩形区域可点击
- Java 兼容性：capacitor.build.gradle VERSION_17 → VERSION_21

**新增：**
- README.md、ROADMAP.md

---

## v1.0.2 — 2026-05-01 (adaptive icon centering)

**修复：**
- Android adaptive icon：M mark 重新居中（translateX=22, translateY=23），补偿 V chevron 视觉重量
- 描边加粗：outer M 5→6dp，inner V 3→4dp
- sharp 渲染参数：lanczos3 kernel + compressionLevel:0
- 背景色统一 #FAF8F5（values XML + PNG）
- 新增 scripts/ic_foreground.svg 作为 icon 前景单一来源

---

## v1.0.1 — 2026-05-01 (bug fixes + UI audit)

**修复：**
- `Settings.jsx` 导出 JSON 双重 stringify 导致备份文件损坏
- `DeckDetail.jsx` 进度条/百分比错误计入 reference 类型卡片，现只统计 recall 卡片
- `DeckDetail.jsx` 恢复 Edit 模式入口按钮（header 内 Edit/Done 切换）
- `DeckDetail.jsx` 手写日期格式化替换为 `localToday()` 工具函数
- `formatSpec.js` prompt 模板追加禁止引用/脚注规则（防 Gemini 附引用）
- `DESIGN.md` 顶部加归档声明，标注 v1.0.0 已重设计
- `ReviewCard.jsx` 移除卡片内重复的收藏星按钮，只保留 header 右上角的 ☆
- `ReviewCard.jsx` 卡片容器对齐设计稿：shadow-md、cursor-pointer、内容垂直居中

**UI 校对（对照 design/mnemos-v2.html）：**
- Home header 标题改用 Instrument Serif 斜体（font-display italic）
- StatsBar 统计卡片加 shadow-md
- Home deck 卡片加 shadow-sm
- DeckDetail 进度条改为 rounded-full（pill 形）
- DeckDetail 主 CTA（START REVIEW）加 shadow-md
- Done 评分网格圆角改为 rounded-sm（8px）
- Browse 卡片容器 shadow-sm → shadow-md

---

## v1.0.0 — 2026-05-01 (UI redesign · v2)

**设计系统：**
- 全新色板：暖纸 parchment (hue 80) + 蓝灰 dark (hue 250)，新增 `--teal`/`--bg-sunken`/`--ink-4`/`--border-soft` 等 token
- 字体体系：Inter (UI) + Instrument Serif (Display) + Noto Serif SC (中文) + JetBrains Mono (数字/代码)，移除 DM Sans
- 新增 Mnemos 品牌 logo (MnemosMark SVG)

**组件重设计：**
- Home：StatsBar 三栏统计 + streak chip + 7 日柱状图；deck 卡片带左侧色条 + 复习 CTA
- DeckDetail：进度条 + 主 CTA (START REVIEW) + 4 图标网格操作 + filter chips (全部/收藏/参考)
- Review：Q/A 角标 + ornament 装饰线 + 翻转动画 (480ms cubic-bezier) + 四色评分按钮 + Done 统计网格
- Browse：共享 Review 卡片样式 + 上下张导航
- Import：dropzone 风格 + segmented control 预览
- PromptGuide：行号 + 语法高亮 code block
- Settings：segmented control 主题切换 + Mnemos 品牌 about 区域

**图标规范：**
- Icons.jsx 所有 icon 默认 size=20，支持 `size` prop 透传
- 按钮容器统一 `w-8 h-8 flex items-center justify-center`，icon 用 size={18}
- 操作按钮（底部 CTA、网格）icon 用 size={16}，与文字保持呼吸间距
- DeckDetail 搜索框修复：移除重复 SearchIcon，定位 icon size={16}

**新增文件：**
- `src/components/Icons.jsx` — 统一 SVG icon 组件库（20px 默认，支持 size prop）
- `design/mnemos-v2.html` — v2 设计稿归档
- `scripts/gen-icons.mjs` — Android app icon 生成脚本
- `android/app/src/main/res/mipmap-*/` — MnemosMark 品牌图标（5 密度）

---

## v0.9.2 — 2026-05-01 (code cleanup)

**修复：**
- `updatedAt` UTC 时区问题：reviewedToday 比较改用 `isoToLocalDate()` 本地日期，修复 UTC+N 时区凌晨统计不准确
- DeckDetail 删除卡组后改用 `useNavigate()` 导航，不再整页刷新
- ReviewCard.jsx 移除未使用的 `onRate` prop 和 `handleRate` 函数
- Settings.jsx 版本号从 package.json 动态读取，不再硬编码
- mdParser.js 移除无效的 `!line.match(/^## /)` 判断

**重构：**
- `shuffle()` 从 Review.jsx 和 Browse.jsx 提取到 `src/lib/utils.js`
- 新建 `src/lib/cardUtils.js`，导出 `isRecall(card)` helper，替换散落的 `(c.type || 'recall') === 'recall'`
- scheduler.js 引入 `isoToLocalDate` 和 `isRecall`，代码更清晰

**文档：**
- issues.md 标记 #1（重复评分按钮）为已修复
- PROJECT_PROMPT.md 标题统一为 Mnemos
- CHANGELOG.md 按版本降序排列，删除重复的 v0.7.0

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

## v0.7.2 — 2026-05-01 (settings)

**新增：** Settings 页面（/settings）
- 主题切换（从首页移入）
- 数据导出 JSON 备份（从首页移入）
- 每日复习上限设置
- 关于信息（名称 + 版本 + GitHub）
- 首页 header 简化为 Mnemos + Edit + ⚙

---

## v0.7.1 — 2026-05-01 (format spec + deck import)

**改进：**
- 返回按钮统一为 ← 纯字符
- DeckDetail 加 Import 按钮，支持追加到当前卡组
- ImportPage 支持 ?deckId= 参数，追加/新建双模式
- 新建 formatSpec.js 作为 prompt 模板和解析规则的单一事实来源
- PromptGuide 从 formatSpec 读取模板，不再硬编码

---

## v0.7.0 — 2026-05-01 (star, stats, rename, dedup)

**新增：**
- 卡片收藏功能（☆/★ 标记 + DeckDetail 筛选）
- 复习结果统计（正确率 + 评分分布）
- Deck 重命名（header 点击编辑）
- 导入去重检测（front 匹配，跳过/全部导入选项）

**新增：** 制卡指南页面（/prompt-guide），内置 prompt 模板一键复制

**改动：**
- App 名称从 MiniSRS 统一为 Mnemos（capacitor, index.html, package.json, strings.xml）
- 新增 PromptGuide.jsx 页面，含完整 prompt 模板和复制功能
- Home.jsx 和 DeckDetail.jsx 底部加制卡指南入口
- .card-content 中文字体确认使用 Noto Serif SC

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

## v0.6.0 — 2026-05-01 (shuffle, pin, preview, search)

**新增：**
- 卡片打乱顺序（Fisher-Yates shuffle，Review + Browse）
- 卡组置顶功能（storage.js pinned 字段 + togglePin）
- 导入预览（解析后展示卡片列表，确认再写入）
- 卡片搜索（DeckDetail 实时过滤，匹配 front/back）

---

## v0.5.1 — 2026-05-01 (navigation + quick review)

**改动：**
- 全部子页面返回按钮统一为 navigate(-1)（Review, Browse, PromptGuide, ImportPage）
- 首页 deck 卡片加快捷 Review 按钮（dueCount > 0 时显示）

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
