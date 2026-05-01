# Changelog

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
