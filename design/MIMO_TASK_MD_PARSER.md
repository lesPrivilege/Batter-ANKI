# MiMo 指令：Markdown Parser + .md Import

## 任务

将 `md-to-cards/md_to_cards/reader.py` 的分块逻辑移植为 `src/lib/mdParser.js`，并在 Home.jsx 中添加 .md 导入入口。

## 背景

用户使用流程：
1. 用户将原始笔记发给 LLM（附带 prompt 模板）→ 得到符合 FORMAT.md 的结构化 .md
2. 用户在 MiniSRS 中导入该 .md → parser 解析为 Card JSON → 开始复习

app 内不做 LLM 调用，parser 是纯前端确定性解析。

## FORMAT.md 体例

```markdown
# 科目名           ← 忽略，不生成卡片
## 大章节          → chapter 字段
### 小节           → section 字段
- 知识点标题       → front（卡片正面）
  释义内容（1-3句） → back（卡片背面）
  - 子知识点       → 归入父级知识点，不单独成卡
```

规则：
- 无 `##` 时，chapter = 文件名（去掉 .md 后缀）
- 无 `###` 时，section = 空字符串
- 每张卡 SM-2 初始值：easiness 2.5, interval 0, repetitions 0, dueDate = 今天
- type 默认 `"recall"`

## 要创建的文件

### `src/lib/mdParser.js`

```javascript
/**
 * Parse structured markdown into Card objects.
 * Input: .md string following FORMAT.md conventions
 * Output: Card[] array (compatible with storage.js addCard)
 */

export function parseMdToCards(mdContent, deckName) {
  // 实现参考下方逻辑
}
```

解析逻辑（从 reader.py 移植）：

1. 按行扫描，维护状态：
   - `currentH2` — 当前 h2 标题（chapter）
   - `currentH3` — 当前 h3 标题（section）
   - `currentItem` — 当前知识点的标题行
   - `currentBody` — 当前知识点的释义行（多行拼接）

2. 遇到的行类型判断（按优先级）：
   - `^# ` 且非 `^## ` → h1，跳过
   - `^## ` → flush 当前知识点，更新 chapter，清空 section
   - `^### ` → flush 当前知识点，更新 section
   - `^- `（非缩进）→ flush 当前知识点，开始新的知识点（front = 去掉 `- ` 后的文本）
   - 缩进行（空格或 tab 开头）→ 追加到 currentBody（back 内容）
   - 空行 → 忽略

3. flush 逻辑：当 currentItem 有内容时，生成一个 Card 对象：
   ```javascript
   {
     id: crypto.randomUUID(),
     deckId: '',  // 由导入流程设置
     front: currentItem,
     back: currentBody.trim(),
     type: 'recall',
     chapter: currentH2 || deckName,
     section: currentH3,
     easiness: 2.5,
     interval: 0,
     repetitions: 0,
     dueDate: todayStr(),
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   }
   ```

4. 边界情况：
   - 缩进的 `- `（子知识点）→ 追加到 currentBody，不启动新知识点
   - 连续空行 → 忽略
   - 文件末尾 → flush 最后一个知识点
   - 空文件或无列表项 → 返回空数组

### 修改 `src/pages/Home.jsx`

在现有 Import 按钮旁添加「Import .md」按钮：

1. **UI**：与 Export/Import 并排，第三个按钮「Import .md」
2. **逻辑**：
   - 点击后打开文件选择器（accept=".md"）
   - 读取文件内容
   - 弹出简易确认：显示将导入 N 张卡
   - 用户输入牌组名（默认取文件名）
   - 调用 `parseMdToCards(content, deckName)` 获取 Card[]
   - 调用 `addDeck(deckName)` 创建牌组
   - 逐张调用 `addCard()` 写入 storage
   - refresh 刷新列表

3. **不改的接口**：
   - `lib/sm2.js` — 不动
   - `lib/scheduler.js` — 不动
   - `lib/storage.js` — 不动（用现有 addDeck + addCard）
   - `lib/mdParser.js` — 新建

## 不要做的

- 不要引入新的 npm 依赖
- 不要改现有组件的接口签名
- 不要加 LLM 调用、API key 输入、网络请求
- 不要做 markdown 渲染（卡片正反面保持纯文本）

## 验证

```bash
npm run build   # 构建无错误
```

用以下测试 .md 验证解析结果：

```markdown
# 测试科目
## 第一章
### 第一节
- 知识点一
  这是释义内容
- 知识点二
  这是第二条释义
  - 补充说明（不应单独成卡）
## 第二章
- 无小节的知识点
  直接在章节下的内容
```

预期输出：3 张卡，chapter/section 正确，子知识点不单独成卡。

## 完成后

更新 `CHANGELOG.md`，commit message: `feat: add .md import with deterministic parser`
