import { useState } from 'react'
import { PROMPT_TEMPLATE } from '../lib/formatSpec'
import { BackIcon, CopyIcon, CheckIcon } from '../components/Icons'
import { useBackButton } from '../lib/useBackButton'

export default function PromptGuide() {
  const { goBack } = useBackButton()
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

  const lines = PROMPT_TEMPLATE.split('\n')

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <header className="sticky top-0 z-10 flex items-center px-[18px] h-[52px] bg-bg border-b" style={{ borderColor: 'var(--border-soft)' }}>
        <button onClick={goBack} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-bg-raised hover:text-ink transition-colors">
          <BackIcon />
        </button>
        <h1 className="flex-1 font-zh text-[17px] font-medium text-ink pl-1">制卡指南</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-[18px] flex flex-col gap-4">
        <p className="text-[13px] text-ink-2 leading-relaxed font-zh">
          将下方 prompt 复制给任意 AI（Claude / GPT / DeepSeek / Kimi…），附上学习材料，即可获得可导入的 .md 文件。
        </p>

        <button onClick={handleCopy}
          className={`w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-md font-body text-sm font-medium active:scale-[0.97] transition-transform
            ${copied ? '' : 'bg-ink text-bg'}`}
          style={copied ? { background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent-line)' } : {}}>
          {copied ? <><CheckIcon size={16} /> 已复制</> : <><CopyIcon size={16} /> 一键复制 Prompt</>}
        </button>

        <div className="rounded-md p-3.5 font-mono text-[11px] leading-[1.7] text-ink-2 whitespace-pre-wrap max-h-[320px] overflow-y-auto relative"
          style={{ background: 'var(--bg-sunken)', border: '1px solid var(--border-soft)' }}>
          {lines.map((line, i) => (
            <div key={i}>
              <span className="text-ink-4 select-none mr-2.5">{String(i+1).padStart(2,'0')}</span>
              {line.startsWith('##') ? <span className="text-accent">{line}</span> : line}
            </div>
          ))}
        </div>

        <div className="text-center text-[11px] text-ink-3 font-mono tracking-wider">
          导入时 · 选择文件 或 粘贴 Markdown
        </div>
      </main>
    </div>
  )
}
