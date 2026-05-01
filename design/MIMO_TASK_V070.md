# MiMo 任务：v0.7.0 — 名称统一 + 字体 + Prompt 指南

## 三个改动

### 1. 外部名称统一为 Mnemos

需要改的文件：
- `capacitor.config.ts` → `appName: 'Mnemos'`
- `index.html` → `<title>Mnemos</title>`
- `package.json` → `name: "mnemos"`
- `android/app/src/main/res/values/strings.xml` → `app_name` 改为 `Mnemos`
- 代码中所有用户可见的 "MiniSRS" / "mini-srs" → "Mnemos"（搜索确认）

不要改的：
- `appId: 'com.lesprivilege.minisrs'` — 不动（改了要重装）
- `localStorage key 'mini-srs-data'` — 不动（改了丢数据）

### 2. 中文宋体字体

- 先检查 `@fontsource/noto-serif-sc` 是否已安装（`ls node_modules/@fontsource/noto-serif-sc`），未安装则 `npm install @fontsource/noto-serif-sc`
- `src/main.jsx` 确认有 `import '@fontsource/noto-serif-sc/400.css'` 和 `500.css`
- `tailwind.config.js` 确认 `fontFamily.serif` 包含 `"Noto Serif SC"`
- `src/styles/markdown.css` 中 `.card-content` 加 `font-family: "Noto Serif SC", "Songti SC", Georgia, serif;` 作为中文内容字体
- 如果已有上述配置，跳过此步

### 3. Prompt 模板页面（制卡指南）

**新建 `src/pages/PromptGuide.jsx`：**

页面内容：
1. 标题："制卡指南"
2. 简短说明："将以下 prompt 复制给任意 AI chatbot（Claude / DeepSeek / GPT / Kimi 等），附上你的学习材料，获得可导入的 .md 文件。"
3. 一键复制按钮（用 `navigator.clipboard.writeText()`，点击后文字变为 "Copied!"，2 秒后恢复）
4. Prompt 模板内容（硬编码在组件中），读取 `design/LLM_PROMPT_TEMPLATE.md` 的 System Prompt 部分（从 `你是一个知识结构化助手` 到结尾的规则部分）
5. 底部备注："导入时在首页选择 Import .md 或 Paste .md"

页面样式：复用现有 Tailwind 类（bg-bg, text-ink, border-border 等），居中布局，max-width 480px。

**修改 `src/App.jsx`：**
- Import PromptGuide
- 加路由：`<Route path="/prompt-guide" element={<PromptGuide />} />`

**修改 `src/pages/Home.jsx`：**
- 底部（Import .md / Paste .md 按钮区域下方）加入口按钮
- 链接到 `/prompt-guide`
- 样式：btn ghost，文字 "制卡指南"

**修改 `src/pages/DeckDetail.jsx`：**
- 操作栏（New Card / Review / Browse / Edit 旁边）加 "制卡指南" 按钮
- 链接到 `/prompt-guide`
- 样式：btn ghost，文字 "制卡指南"

## 不改的

- lib/ 全部不动
- Review.jsx, Browse.jsx 不动
- CardEditor.jsx 不动

## 更新 CHANGELOG.md

```
## v0.7.0 — 2026-05-01 (prompt guide)

**新增：** 制卡指南页面（/prompt-guide），内置 prompt 模板一键复制

**改动：**
- App 名称从 MiniSRS 统一为 Mnemos（capacitor, index.html, package.json, strings.xml）
- 新增 PromptGuide.jsx 页面，含完整 prompt 模板和复制功能
- Home.jsx 和 DeckDetail.jsx 底部加制卡指南入口
- .card-content 中文字体确认使用 Noto Serif SC
```

## 验证

```bash
npm run build
```

## Return

改了什么文件，build 结果。
