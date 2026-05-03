# Changelog

## v1.0.0 — 2026-05-03

正式发行版。全面 review / debug + 设计原型打包 + APK 构建。

### 修复

- `Review.jsx` — `card.deckName` 永远 undefined，顶栏永远显示「复习」→ 改用 `getDeck(id)` 查询真实卡组名
- `DeckDetail.jsx` — 预览弹窗渲染原始 markdown 文本 → 新增 `PreviewContent` 组件，正确渲染 markdown + KaTeX
- `Review.jsx` — 触控滑动直接评分不翻面 → 改为首次滑动翻面，二次滑动才评分（对齐 Browse 行为）
- `ReviewCard.jsx` — `flipped` 状态从组件内提升至 Review.jsx，支持键盘快捷键

### 新增

- `Review.jsx` — 键盘快捷键：Space/Enter 翻面，← Again，→ Good（对齐 Browse.jsx）
- `FlashcardHomeContent.jsx` — 空状态增加中文标语「记忆是一切的开端」（对齐旧原型）
- `mnemos-prototype.html` — 14 屏设计原型（stage shell + phone frames + dark mode toggle）
- `mnemos-v1.0.0.apk` — Android debug APK

### 清理

- `SetDetail.jsx` — 删除未使用的 `useEffect` import
- `ReviewCard.jsx` — 删除未使用的 `useState` import
- `styles/index.css` — 新增 `.qa-opt:disabled { cursor: default }` 规则
- `issues.md` — 所有 issue 已修复，清空为完成状态

### CSS

- `.qa-opt:disabled` — 禁用态鼠标样式改为 default
