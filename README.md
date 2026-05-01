# Mnemos

间隔重复记忆 app，基于 SM-2 算法。

## 工作流

```
学习材料 → chatbot + prompt 模板 → .md 文件 → app 导入 → SM-2 复习
```

用户用任意 AI（Claude / GPT / DeepSeek / Gemini）生成结构化 .md，导入后按间隔重复规律复习。

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | React 18 |
| 构建 | Vite 6 |
| 样式 | Tailwind 3 + CSS 自定义属性 |
| 移动端 | Capacitor 8（Android） |
| 字体 | Inter + Instrument Serif + Noto Serif SC + JetBrains Mono |
| 渲染 | marked + KaTeX + DOMPurify |

## 本地开发

```bash
npm install
npm run dev        # http://localhost:5173
```

## 打 APK

```bash
npm run build
npx cap sync android
sed -i '' 's/VERSION_21/VERSION_17/g' android/app/capacitor.build.gradle
sed -i '' 's/VERSION_21/VERSION_17/g' android/capacitor-cordova-android-plugins/build.gradle
sed -i '' 's/VERSION_21/VERSION_17/g' node_modules/@capacitor/android/capacitor/build.gradle
cd android
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

## 项目结构

```
src/
  pages/          Home, DeckDetail, Review, Browse, ImportPage, Settings, PromptGuide
  components/     ReviewCard, CardEditor, StatsBar, Icons
  lib/            scheduler, mdParser, storage, formatSpec, renderMarkdown, sm2, utils, cardUtils, dateUtils
  styles/         index.css, markdown.css
design/           mnemos-v2.html（权威设计稿）, anki-v1.html（旧稿）, MIMO/LLM 任务文档
scripts/          gen-icons.mjs, gen-splash.mjs, ic_foreground.svg
android/          Capacitor Android 工程
```

## 设计

`design/mnemos-v2.html` 是权威设计稿，所有 UI 改动以此为基准。双主题（light parchment + dark blue-grey），11 屏交互原型。

`design/anki-v1.html` 是旧版参考稿；`design/*.md` 记录 LLM prompt、解析器和 v0.7.0 任务说明。

## 制卡流程

1. 复制 prompt 模板（`src/lib/formatSpec.js`，或 app 内 PromptGuide 页面一键复制）
2. 发给任意 chatbot，附学习材料
3. 得到结构化 .md（chapter → section → Q&A 对）
4. app 内 Import → 选择文件或粘贴 → 预览确认 → 导入
5. 卡组进入 SM-2 复习循环

Prompt 模板和解析规则统一维护在 `src/lib/formatSpec.js`，保证生成端和消费端一致。
