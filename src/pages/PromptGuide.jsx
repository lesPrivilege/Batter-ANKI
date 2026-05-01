import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PROMPT_TEMPLATE = `你是一个知识结构化助手。请将我提供的笔记内容转换为结构化的 Markdown 格式，用于制作复习卡片。

输出格式必须严格遵循以下结构：

# [科目名]
## [大章节名]
### [小节名]
- [知识点标题]
  [对该知识点的释义或解释，1-3 句话]
- [下一个知识点标题]
  [释义]
  - [补充说明或子知识点，归入父级]

## 规则

### 标题层级
- # 且仅 # 后跟科目名（整个文件只有一个）
- ## 后跟大章节名
- ### 后跟小节名
- 没有 ## 的内容，章节名取文件名
- 没有 ### 的内容，小节名留空

### 知识点（- 开头的列表项）
- 每个 - 后是知识点标题（即卡片正面）
- 缩进的非列表行是该知识点的释义（即卡片背面）
- 缩进的 - 是子知识点，归入父级知识点，不单独成卡
- 每张卡的释义控制在 1-3 句话，简洁准确

### 内容要求
- 保持原文语言（中文笔记输出中文，英文笔记输出英文）
- 删除与知识无关的过渡语、开场白、总结语
- 如果某段内容无法形成有意义的知识点（如纯标题、空章节），跳过
- 不要添加原文没有的内容
- 不要添加编号、emoji、装饰性符号
- 公式用 LaTeX：行内公式用反引号包裹 \`$公式$\`，块级公式用 \`$$公式$$\`

### 示例

输入：
"唐朝的三省六部制。中书省负责起草诏令，门下省负责审核，尚书省负责执行。尚书省下设六部：吏部、户部、礼部、兵部、刑部、工部。"

输出：
# 中国法制史
## 唐朝
### 三省六部制
- 三省的职能分工
  中书省负责起草诏令，门下省负责审核，尚书省负责执行。三省相互制衡，分散相权。
- 六部的组成
  尚书省下设吏部、户部、礼部、兵部、刑部、工部，分管具体行政事务。`

export default function PromptGuide() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT_TEMPLATE)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = PROMPT_TEMPLATE
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <header className="sticky top-0 z-10 flex items-center px-4 h-12
        bg-bg-card border-b border-border">
        <button onClick={() => navigate(-1)} className="text-ink-2 text-sm mr-3">←</button>
        <h1 className="flex-1 text-lg font-serif font-bold text-ink">制卡指南</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 max-w-[480px] w-full mx-auto space-y-4">
        <p className="text-sm text-ink-2 leading-relaxed">
          将以下 prompt 复制给任意 AI chatbot（Claude / DeepSeek / GPT / Kimi 等），附上你的学习材料，获得可导入的 .md 文件。
        </p>

        <button
          onClick={handleCopy}
          className={`w-full py-2.5 rounded-lg font-ui text-sm font-medium border active:scale-[0.97] transition-transform ${
            copied
              ? 'border-success text-success bg-success-bg'
              : 'border-accent text-accent'
          }`}
        >
          {copied ? 'Copied!' : '一键复制 Prompt'}
        </button>

        <div className="p-4 rounded-lg border border-border bg-bg-card">
          <pre className="text-xs text-ink font-serif whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {PROMPT_TEMPLATE}
          </pre>
        </div>

        <p className="text-xs text-ink-2 text-center pt-2 pb-4">
          导入时在首页选择 Import .md 或 Paste .md
        </p>
      </main>
    </div>
  )
}
