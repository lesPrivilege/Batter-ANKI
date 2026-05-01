import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PROMPT_TEMPLATE } from '../lib/formatSpec'

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
