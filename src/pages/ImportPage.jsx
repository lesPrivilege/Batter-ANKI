import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addDeck, addCard, importData } from '../lib/storage'
import { parseMdToCards } from '../lib/mdParser'

export default function ImportPage() {
  const navigate = useNavigate()
  const [pasteMd, setPasteMd] = useState('')
  const fileInputRef = useRef(null)

  const processMdContent = (mdContent, defaultDeckName) => {
    const cards = parseMdToCards(mdContent, defaultDeckName)
    if (cards.length === 0) {
      alert('未识别到卡片。请确认 .md 格式是否正确。')
      navigate('/prompt-guide')
      return
    }
    const deckName = prompt(`Import ${cards.length} card(s). Enter deck name:`, defaultDeckName)
    if (deckName === null) return
    const name = deckName.trim() || defaultDeckName
    const deck = addDeck(name)
    for (const card of cards) {
      addCard(deck.id, card.front, card.back, card.type, card.chapter, card.section)
    }
    navigate('/')
  }

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ext === 'json') {
        try {
          importData(ev.target.result)
          navigate('/')
        } catch {
          alert('Import failed: invalid JSON format')
        }
      } else if (ext === 'md') {
        processMdContent(ev.target.result, file.name.replace(/\.md$/i, ''))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handlePasteSubmit = () => {
    if (!pasteMd.trim()) return
    processMdContent(pasteMd, 'Pasted Notes')
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 h-12
        bg-bg-card border-b border-border shrink-0">
        <button onClick={() => navigate(-1)} className="text-ink-2 active:scale-[0.97]">
          ← back
        </button>
        <h1 className="text-lg font-serif font-bold text-ink">Import</h1>
      </header>

      <main className="flex-1 overflow-y-auto max-w-[480px] w-full mx-auto px-4 pt-4 pb-4 space-y-4">
        <div className="bg-bg-card border border-border rounded-lg p-4">
          <p className="text-sm font-ui font-medium text-ink mb-2">从文件导入</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 rounded-lg font-ui text-sm text-ink-2
              border border-border active:scale-[0.97] transition-transform"
          >
            选择文件
          </button>
          <p className="text-xs text-ink-2 mt-1.5">支持 .md 和 .json 格式</p>
        </div>

        <div className="bg-bg-card border border-border rounded-lg p-4">
          <p className="text-sm font-ui font-medium text-ink mb-2">粘贴文本</p>
          <textarea
            value={pasteMd}
            onChange={(e) => setPasteMd(e.target.value)}
            placeholder="Paste markdown here..."
            className="w-full h-40 px-3 py-2.5 rounded-lg border border-border bg-bg-card text-ink
              font-ui text-sm placeholder:text-ink-2/50 resize-none
              focus:outline-none focus:border-accent"
          />
          <button
            onClick={handlePasteSubmit}
            disabled={!pasteMd.trim()}
            className="w-full mt-2 py-2.5 rounded-lg font-ui text-sm font-medium text-accent
              border border-accent active:scale-[0.97] transition-transform
              disabled:opacity-40"
          >
            导入
          </button>
        </div>

        <p className="text-xs text-ink-2 text-center">
          不知道如何准备内容？ <Link to="/prompt-guide" className="text-accent">查看制卡指南</Link>
        </p>
      </main>

      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.json"
        onChange={handleFileSelected}
        className="hidden"
      />
    </div>
  )
}
