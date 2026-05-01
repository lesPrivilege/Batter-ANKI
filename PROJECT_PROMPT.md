# Batter-ANKI — MiMo 工作规范

## 项目概述

Batter-ANKI 是考研 SRS 复习系统的前端，与 md-to-cards（Python CLI）形成闭环：
- md-to-cards：.md → LLM 提取 → JSON
- Batter-ANKI：JSON 导入 → SM-2 复习 → 大纲视图

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

## 构建注意事项

### Capacitor Android

- `npx cap sync` 每次改完前端代码都要重新跑
- Capacitor 8 默认生成的 build.gradle 写 `VERSION_21`，当前环境是 Java 17
- app/build.gradle 已有 override 兜底，sync 后确认 override 仍生效
- BrowserRouter 不兼容 Capacitor WebView，必须用 HashRouter

### 字体

- Google Fonts CDN 已替换为 @fontsource（离线可用）
- 设计稿可能指定不同字体，以设计稿为准，但必须用 @fontsource 打包

### APK 构建

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
# 输出：android/app/build/outputs/apk/debug/app-debug.apk
```

### Python 兼容

- Python 3.14 的 Path.glob() 不接受绝对路径，用 Path.exists() 替代

## 当前状态 (v0.2.0)

### 已完成

- 3 页面 SPA：Home / DeckDetail / Review
- SM-2 算法 + localStorage 持久化
- recall/reference 双类型卡片
- 大纲视图（chapter → section 两级折叠）
- JSON 导入/导出
- 深色模式
- Capacitor Android 配置
- Debug APK 构建成功（4.7MB）

### 待开发（标记但不做，等指令）

- [ ] UI 全面重设计（v1 设计稿在 design/anki-v1.html，等指令融合）
- [ ] Markdown 渲染：卡片正反面支持 markdown 语法
- [ ] LLM 集成解耦：app 内配置 API key（localStorage，不进 bundle），运行时调用
- [ ] md-to-cards 管线集成：md → reader → extractor → writer → 导入
- [ ] 中间格式解耦（等第二个消费端）
- [ ] FSRS 升级（等 SM-2 不够用）
- [ ] 跨设备同步

## 文件结构

```
src/
  App.jsx              ← HashRouter 路由
  main.jsx             ← 入口 + @fontsource 导入
  pages/
    Home.jsx           ← deck 列表、统计、导入导出
    DeckDetail.jsx     ← 大纲视图 + 卡片 CRUD
    Review.jsx         ← 翻卡复习 + SM-2 评分
  components/
    ReviewCard.jsx     ← 翻卡交互
    CardEditor.jsx     ← 卡片编辑表单
    StatsBar.jsx       ← 7 日到期分布条形图
  lib/
    sm2.js             ← SM-2 算法
    scheduler.js       ← 到期判定 + 排序
    storage.js         ← localStorage CRUD
  styles/
    index.css          ← Tailwind + CSS 变量（light/dark）
design/
  anki-v1.html         ← Claude 设计稿 v1（归档）
data/                  ← 测试用 JSON（不打包进 APK）
capacitor.config.ts    ← appId: com.lesprivilege.minisrs
```

## 安全红线

- API key 只存 localStorage，不进 source code / bundle / git
- 不上传用户数据到任何后端
- 不引入带远程遥测的依赖
