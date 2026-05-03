# Mnemos — MiMo 工作规范

## 项目概述

Mnemos 是考研 SRS 复习系统的前端，与 md-to-cards（Python CLI）形成闭环：
- md-to-cards：.md → LLM 提取 → JSON
- Mnemos：JSON 导入 → SM-2 复习 → 大纲视图

技术栈：React 18 + Vite 6 + Tailwind 3 + Capacitor 8 + @fontsource
Repo：github.com/lesPrivilege/Batter-ANKI

## 工作流

### 三端分工

| 端 | 职责 |
|---|---|
| Claude 客户端 (master) | 架构决策、prompt/criteria、进度同步 |
| 本地 MiMo (OpenCode) | 功能开发、构建、commit |
| claude.ai/design | UI 设计迭代，读 src/ 最新代码出 HTML 设计稿 |

### 你（MiMo）的职责

1. 在 src/ 中开发功能
2. 构建和测试
3. 维护 CHANGELOG.md
4. Commit 并 push

### 版本管理规则

- 每次 commit 前，先更新 CHANGELOG.md
- 格式：`## vX.Y.Z — YYYY-MM-DD`，列出本次变更
- 前缀：`feat:` / `fix:` / `build:` / `refactor:` / `style:`
- Commit message 与 CHANGELOG 条目一致

### 代码规范

- 增量编辑优先，不要全文件重写
- 改动前先读相关文件确认上下文
- 不引入未经确认的新依赖（先提出，等确认）
- API key、secret 等敏感信息不得出现在源码或 bundle 中

## 设计系统

v0.3.0 已完成 anki.html → Tailwind 的设计迁移。当前设计语言：

### 色板（OKLCh，hue 60 暖棕）

| Token | Light | Dark | 用途 |
|---|---|---|---|
| `--bg` | oklch(97% 0.009 60) | oklch(14% 0.016 60) | 页面背景 |
| `--bg-card` | oklch(99.5% 0.004 60) | oklch(18% 0.018 60) | 卡片/面板 |
| `--bg-raised` | oklch(95% 0.012 60) | oklch(21% 0.018 60) | Hover 状态 |
| `--ink` | oklch(22% 0.020 60) | oklch(92% 0.008 60) | 主文字 |
| `--ink-2` | oklch(46% 0.018 60) | oklch(72% 0.010 60) | 次要文字 |
| `--ink-3` | oklch(66% 0.012 60) | oklch(52% 0.008 60) | 辅助文字 |
| `--accent` | oklch(60% 0.16 40) | oklch(68% 0.16 40) | 主操作色 |
| `--success` | oklch(58% 0.14 155) | oklch(64% 0.14 155) | Easy/成功 |
| `--warning` | oklch(62% 0.14 80) | oklch(68% 0.14 80) | Hard/警告 |
| `--danger` | oklch(56% 0.16 20) | oklch(64% 0.16 20) | Again/危险 |

### 字体

- UI：DM Sans（@fontsource/dm-sans，400/500/600）
- 中文衬线：Noto Serif SC（@fontsource/noto-serif-sc，400/500/600）
- Tailwind class：`font-ui`（DM Sans）、`font-serif`（Noto Serif SC）

### 间距/圆角/阴影

- 间距 base：4px
- 圆角：14px（lg）、8px（sm）
- 阴影：`shadow-card`（卡片）、`shadow-raised`（浮层）

### Tailwind Token 映射

```
bg-bg / bg-bg-card / bg-bg-raised
text-ink / text-ink-2 / text-ink-3
border-border / border-border-strong
bg-accent / bg-accent-bg / border-accent-border
bg-success-bg / bg-warning-bg / bg-danger-bg
```

## 构建注意事项

### Capacitor Android（重要：按顺序执行）

```bash
# 1. 构建前端
npm run build

# 2. 同步到 Android
npx cap sync android

# 3. ⚠️ 必须 patch Java 版本（cap sync 会覆盖）
sed -i '' 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' \
  node_modules/@capacitor/android/capacitor/build.gradle \
  node_modules/@capacitor/app/android/build.gradle \
  android/app/capacitor.build.gradle \
  android/capacitor-cordova-android-plugins/build.gradle

# 4. 构建 APK
cd android && ./gradlew assembleDebug
# 产物：android/app/build/outputs/apk/debug/app-debug.apk

# 5. 输出到 Downloads（约定路径）
cp app/build/outputs/apk/debug/app-debug.apk ~/Downloads/mnemos-v{version}-debug.apk
```

**APK 输出约定：** `~/Downloads/mnemos-v{版本号}-debug.apk`，旧版 APK 打包前先清理。

**踩过的坑：**
- `cap sync` 每次都会把 `node_modules/@capacitor/android/capacitor/build.gradle` 的 Java 版本重置为 `VERSION_21`
- `app/build.gradle` 的 override 不够——`capacitor-android` 模块独立编译，需要 patch `node_modules` 里的文件
- BrowserRouter 不兼容 Capacitor WebView，必须用 HashRouter
- 每次 `cap sync` 后都要重新 patch，没有一劳永逸的办法

### 字体

- 使用 @fontsource 本地打包（离线可用），不用 Google Fonts CDN
- Noto Serif SC 中文字体较大（APK 从 4.7MB → 16MB），这是预期行为
- 设计稿可能指定不同字体，以设计稿为准，但必须用 @fontsource 打包

### Python 兼容

- Python 3.14 的 Path.glob() 不接受绝对路径，用 Path.exists() 替代

## 当前状态 (v1.0.0)

### 已完成

- 13 路由 SPA：Home / DeckDetail / Review / Browse / QuizPage / QuizReview / SetDetail / Import / Wrong / Starred / Search / PromptGuide / Settings
- SM-2 间隔重复 + Quiz 练习双模式
- recall/reference 双类型卡片 + choice/review 双类型题目
- 大纲视图（chapter → section 两级折叠）
- Markdown + KaTeX 渲染管线（marked + DOMPurify）
- JSON / MD 导入 + 预览 + 去重
- 深色模式（oklch 色板，light warm parchment + dark blue-grey）
- 键盘快捷键（Browse / Review）
- Capacitor Android APK 构建
- 14 屏设计原型（stage shell + phone frames）

### 待开发（按需求驱动）

- [ ] 日历视图 / 复习回顾
- [ ] 环状进度图 / 学习计划
- [ ] 批量管理章节目录
- [ ] 跨设备同步（iCloud / Git / Supabase）
- [ ] FSRS 算法升级
- [ ] 导入去重增强（模糊匹配）

## 文件结构

```
src/
  App.jsx              ← HashRouter 路由（13 条）
  main.jsx             ← 入口 + @fontsource 字体加载
  pages/
    Home.jsx           ← Tab 切换（记忆/练习）
    FlashcardHomeContent.jsx  ← 记忆卡首页（hero + 卡组列表）
    QuizHomeContent.jsx       ← 练习首页（hero + 科目列表）
    DeckDetail.jsx     ← 大纲视图 + 卡片 CRUD + 预览
    Review.jsx         ← 翻卡复习 + SM-2 评分 + 键盘快捷键
    Browse.jsx         ← 顺序浏览 + 3D 翻卡
    QuizPage.jsx       ← 选择题练习
    QuizReview.jsx     ← 解答题练习
    SetDetail.jsx      ← 科目详情 + 章节分解
    Import.jsx         ← JSON/MD 导入 + 预览
    Wrong.jsx          ← 错题本
    Starred.jsx        ← 收藏
    Search.jsx         ← 全局搜索
    PromptGuide.jsx    ← 制卡 prompt 模板
    Settings.jsx       ← 主题/统计/导出/危险操作
  components/
    ReviewCard.jsx     ← 翻卡交互（flipped 状态由父组件管理）
    CardEditor.jsx     ← 卡片编辑表单
    Icons.jsx          ← 内联 SVG 图标库
  lib/
    sm2.js             ← SM-2 算法
    scheduler.js       ← 到期判定 + 排序
    storage.js         ← localStorage CRUD
    mdParser.js        ← Markdown → 卡片解析
    formatSpec.js      ← Prompt 模板 + 格式规范（单一来源）
    renderMarkdown.js  ← marked + KaTeX + DOMPurify
    cardUtils.js       ← 卡片类型判断
    dateUtils.js       ← 日期工具
    platform.js        ← Capacitor 平台检测
    useBackButton.js   ← Android 返回键
    useRenderedMarkdown.js ← 异步 markdown 渲染 hook
    utils.js           ← shuffle / downloadBlob
  quiz/
    components/RenderMarkdown.jsx
    lib/quizEngine.js, storage.js, questionParser.js, subjectMeta.js, subjectNames.js
  styles/
    index.css          ← 设计系统（oklch 色板 + 组件类）
    markdown.css       ← 卡片内容排版
design/                ← 设计稿归档
scripts/               ← 图标/启动画面生成脚本
android/               ← Capacitor Android 工程
mnemos-prototype.html  ← 14 屏设计原型（单文件）
CHANGELOG.md           ← 版本变更记录
PROJECT_PROMPT.md      ← 本文件
```

## 安全红线

- API key 只存 localStorage，不进 source code / bundle / git
- 不上传用户数据到任何后端
- 不引入带远程遥测的依赖
