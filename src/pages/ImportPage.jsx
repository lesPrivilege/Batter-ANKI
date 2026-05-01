import { useState, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addDeck, addCard, getCards, getDecks, importData } from '../lib/storage'
import { parseMdToCards } from '../lib/mdParser'

export default function ImportPage() {
  const navigate = useNavigate()
  const [pasteMd, setPasteMd] = useState('')
  const [previewData, setPreviewData] = useState(null)
  const [previewName, setPreviewName] = useState('')
  const [skipDup, setSkipDup] = useState(false)
  const fileInputRef = useRef(null)

  const dedup = useMemo(() => {
    if (!previewData) return { count: 0, filtered: [] }
    const trimmedName = previewName.trim() || previewData.defaultName
    const decks = getDecks()
    const existingDeck = decks.find(d => d.name === trimmedName)
    if (!existingDeck) return { count: 0, filtered: previewData.cards }
    const existingCards = getCards(existingDeck.id)
    const existingFronts = new Set(existingCards.map(c => c.front.trim()))
    const duplicates = previewData.cards.filter(c => existingFronts.has(c.front.trim()))
    return {
      count: duplicates.length,
      filtered: previewData.cards.filter(c => !existingFronts.has(c.front.trim()))
    }
  }, [previewData, previewName])

  const processMdContent = (mdContent, defaultDeckName) => {
    const { cards, deckName } = parseMdToCards(mdContent, defaultDeckName)
    if (cards.length === 0) {
      alert('未识别到卡片。请确认 .md 格式是否正确。')
      navigate('/prompt-guide')
      return
    }
    const resolvedName = deckName || defaultDeckName
    setPreviewData({ cards, defaultName: resolvedName })
    setPreviewName(resolvedName)
  }

  const handleConfirmImport = () => {
    const name = previewName.trim() || previewData.defaultName
    const deck = addDeck(name)
    const cardsToImport = skipDup ? dedup.filtered : previewData.cards
    for (const card of cardsToImport) {
      addCard(deck.id, card.front, card.back, card.type, card.chapter, card.section)
    }
    setPreviewData(null)
    setPreviewName('')
    setSkipDup(false)
    navigate('/')
  }

  const handleCancelImport = () => {
    setPreviewData(null)
    setPreviewName('')
    setPasteMd('')
    setSkipDup(false)
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

  if (previewData) {
    return (
      <div className="flex flex-col min-h-screen bg-bg">
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 h-12
          bg-bg-card border-b border-border shrink-0">
          <button onClick={handleCancelImport} className="text-ink-2 active:scale-[0.97]">
            ← back
          </button>
          <h1 className="text-lg font-serif font-bold text-ink">Import Preview</h1>
        </header>

        <main className="flex-1 overflow-y-auto max-w-[480px] w-full mx-auto px-4 pt-4 pb-4 space-y-4">
          <div className="bg-bg-card border border-border rounded-lg p-4 space-y-3">
            <div>
              <label className="text-sm font-ui text-ink-2 mb-1 block">Deck name</label>
              <input
                type="text"
                value={previewName}
                onChange={(e) => setPreviewName(e.target.value)}
                placeholder={previewData.defaultName}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-card text-ink
                  font-ui text-sm placeholder:text-ink-2/50
                  focus:outline-none focus:border-accent"
              />
            </div>
            <p className="text-sm text-ink font-ui">
              将导入 <span className="font-medium text-accent">{skipDup ? dedup.filtered.length : previewData.cards.length}</span> 张卡片
              {dedup.count > 0 && (
                <span className="text-warning ml-1">（其中 {dedup.count} 张与已有卡片重复）</span>
              )}
            </p>
            {dedup.count > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setSkipDup(true)}
                  className={`flex-1 py-2 rounded-lg font-ui text-sm border transition-colors ${
                    skipDup ? 'bg-accent text-white border-accent' : 'border-border text-ink-2'
                  }`}
                >
                  跳过重复
                </button>
                <button
                  onClick={() => setSkipDup(false)}
                  className={`flex-1 py-2 rounded-lg font-ui text-sm border transition-colors ${
                    !skipDup ? 'bg-accent text-white border-accent' : 'border-border text-ink-2'
                  }`}
                >
                  全部导入
                </button>
              </div>
            )}
            <div>
              <p className="text-xs text-ink-2 mb-1.5">Card preview:</p>
              <ul className="space-y-1">
                {previewData.cards.slice(0, 5).map((card, i) => (
                  <li key={i} className="text-sm text-ink truncate pl-2 border-l-2 border-border">
                    {card.front}
                  </li>
                ))}
                {previewData.cards.length > 5 && (
                  <li className="text-xs text-ink-2 pl-2">
                    ...and {previewData.cards.length - 5} more
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleConfirmImport}
              className="flex-1 py-2.5 rounded-lg font-ui text-sm font-medium text-white
                bg-accent active:scale-[0.97] transition-transform"
            >
              确认导入
            </button>
            <button
              onClick={handleCancelImport}
              className="flex-1 py-2.5 rounded-lg font-ui text-sm text-ink-2
                border border-border active:scale-[0.97] transition-transform"
            >
              取消
            </button>
          </div>
        </main>
      </div>
    )
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
