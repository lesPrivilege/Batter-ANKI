# Mnemos

间隔重复记忆 + 题目练习 app。SM-2 算法 + 题库系统，覆盖闪卡复习与选择题/解答题练习。

## 工作流

```
学习材料 → chatbot + prompt 模板 → .md / .json → 导入 → SM-2 复习 / 题库练习
```

两种数据通道：
- **闪卡**：AI 生成结构化 .md，导入后按间隔重复复习（SM-2 算法）
- **题库**：`questions.json`（支持 choice + review 题型），导入后可练习选择题、解答题，自动记录错题

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | React 18 |
| 构建 | Vite 6 |
| 样式 | Tailwind 3 + CSS 自定义属性（oklch 色值） |
| 移动端 | Capacitor 8（Android） |
| 字体 | Inter + Instrument Serif + Noto Serif SC + JetBrains Mono |
| 渲染 | marked + KaTeX + DOMPurify |
| 存储 | localStorage（主数据 + 进度 + 收藏 + 复习日志） |

## 功能

| 模块 | 说明 |
|------|------|
| 闪卡复习 | SM-2 间隔重复，4 级评分（Again/Hard/Good/Easy），撤销（Ctrl+Z） |
| 卡片浏览 | 逐张翻卡浏览，正反面对照，支持 markdown + LaTeX 渲染 |
| 题库练习 | 选择题作答 + 解答题翻卡自评，四种模式（随机/顺序/未做/错题） |
| 错题本 | 自动记录连续做错题目，支持按科目筛选 |
| 收藏 | 星标收藏卡片和题目 |
| 搜索 | 跨闪卡 + 题库全文搜索（300ms debounce） |
| 导入 | JSON（题库）、MD（闪卡）、JSON backup 合并/替换 |
| 导出 | 闪卡 JSON、全量备份（含进度和收藏） |
| 外观 | Light / Dark 双主题，OKLCH 色值系统 |
| 复习日志 | `mnemos-review-log` 独立存储，90 天自动清理 |

## 本地开发

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
```

## 打包 APK

```bash
~/Scripts/build-mnemos-apk
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

## 导入题库

支持 questions.json 格式，通过 `ocr-cleaner` skill 从课本 PDF 清洗生成。777 题全量题库（王道数据结构 2027）可直接导入。

```json
{
  "id": "wangdao-ds-ch01-001",
  "source": "wangdao-ds",
  "subject": "data-structure",
  "chapter": "第1章 绪论",
  "section": "1.1 数据结构的基本概念",
  "type": "choice",
  "question": "...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "answer": "C",
  "explanation": "..."
}
```

## 项目结构

```
src/
  pages/            Home, DeckDetail, Review, Browse, Import, Settings,
                    PromptGuide, Search, Starred, Wrong,
                    QuizPage, QuizReview, SetDetail,
                    FlashcardHomeContent, QuizHomeContent
  components/       ReviewCard, CardEditor, HeroSection, ErrorBoundary, Icons
  lib/              scheduler, mdParser, storage, formatSpec, sm2,
                    renderMarkdown, useBackButton, reviewLog,
                    dateUtils, cardUtils, utils, platform
  quiz/             components/RenderMarkdown, lib/questionParser, quizEngine, storage,
                    subjectMeta, subjectNames
  styles/           index.css, markdown.css
android/            Capacitor Android 工程
```

## 制卡 prompt

在 app 内「导入 → 制卡指南」页面可一键复制 prompt 模板，发给任意 AI 生成结构化 .md。
