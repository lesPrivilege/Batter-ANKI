import { useState, useRef, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { addDeck, addCard, getCards, getDecks, getDeck, importData } from '../lib/storage'
import { parseMdToCards } from '../lib/mdParser'
import { BackIcon, UploadIcon, PasteIcon } from '../components/Icons'

export default function ImportPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const targetDeckId = searchParams.get('deckId')
  const targetDeck = targetDeckId ? getDeck(targetDeckId) : null
  const [importMode, setImportMode] = useState(targetDeckId ? 'append' : 'new')
  const [pasteMd, setPasteMd] = useState('')
  const [previewData, setPreviewData] = useState(null)
  const [previewName, setPreviewName] = useState('')
  const [skipDup, setSkipDup] = useState(false)
  const fileInputRef = useRef(null)

  const dedup = useMemo(() => {
    if (!previewData) return { count: 0, filtered: [] }
    let existingCards = []
    if (importMode === 'append' && targetDeckId) {
      existingCards = getCards(targetDeckId)
    } else {
      const trimmedName = previewName.trim() || previewData.defaultName
      const decks = getDecks()
      const existingDeck = decks.find(d => d.name === trimmedName)
      if (existingDeck) existingCards = getCards(existingDeck.id)
    }
    if (existingCards.length === 0) return { count: 0, filtered: previewData.cards }
    const existingFronts = new Set(existingCards.map(c => c.front.trim()))
    const duplicates = previewData.cards.filter(c => existingFronts.has(c.front.trim()))
    return {
      count: duplicates.length,
      filtered: previewData.cards.filter(c => !existingFronts.has(c.front.trim()))
    }
  }, [previewData, previewName, importMode, targetDeckId])

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
    const cardsToImport = skipDup ? dedup.filtered : previewData.cards
    let deckId
    if (importMode === 'append' && targetDeckId) {
      deckId = targetDeckId
    } else {
      const name = previewName.trim() || previewData.defaultName
      const deck = addDeck(name)
      deckId = deck.id
    }
    for (const card of cardsToImport) {
      addCard(deckId, card.front, card.back, card.type, card.chapter, card.section)
    }
    setPreviewData(null)
    setPreviewName('')
    setSkipDup(false)
    setImportMode(targetDeckId ? 'append' : 'new')
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

  // Preview mode
  if (previewData) {
    return (
      <div className="flex flex-col min-h-screen bg-bg">
        <header className="sticky top-0 z-10 flex items-center px-[18px] h-[52px] bg-bg border-b" style={{ borderColor: 'var(--border-soft)' }}>
          <button onClick={handleCancelImport} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-bg-raised hover:text-ink transition-colors">
            <BackIcon />
          </button>
          <h1 className="flex-1 font-zh text-[17px] font-medium text-ink pl-1">导入预览</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-[18px] flex flex-col gap-4">
          <div className="bg-bg-card rounded-md p-4 flex flex-col gap-2.5" style={{ border: '1px solid var(--border-soft)' }}>
            <div className="font-zh text-sm font-medium text-ink">合并方式</div>
            <div className="inline-flex p-0.5 rounded-lg" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-soft)' }}>
              <button onClick={() => setImportMode('append')}
                className={`flex-1 py-[7px] px-2.5 text-[12px] font-medium rounded-md transition-all ${importMode === 'append' ? 'bg-bg-card text-ink shadow-sm' : 'text-ink-2'}`}>
                追加到已有
              </button>
              <button onClick={() => setImportMode('new')}
                className={`flex-1 py-[7px] px-2.5 text-[12px] font-medium rounded-md transition-all ${importMode === 'new' ? 'bg-bg-card text-ink shadow-sm' : 'text-ink-2'}`}>
                新建卡组
              </button>
            </div>
            {importMode === 'new' && (
              <input value={previewName} onChange={(e) => setPreviewName(e.target.value)}
                className="w-full py-[9px] px-3 rounded-md border bg-bg text-ink font-zh text-sm outline-none focus:border-accent"
                style={{ borderColor: 'var(--border)' }} />
            )}
            <div className="flex justify-between items-baseline py-1.5 border-b" style={{ borderColor: 'var(--border-soft)' }}>
              <span className="font-zh text-xs text-ink-2">解析卡片</span>
              <span className="font-mono text-xs text-ink">{previewData.cards.length}</span>
            </div>
            <div className="flex justify-between items-baseline py-1.5 border-b" style={{ borderColor: 'var(--border-soft)' }}>
              <span className="font-zh text-xs text-ink-2">重复卡片</span>
              <span className="font-mono text-xs" style={{ color: 'var(--warn)' }}>{dedup.count}</span>
            </div>
            <div className="flex justify-between items-baseline py-1.5">
              <span className="font-zh text-xs text-ink-2">将导入</span>
              <span className="font-mono text-xs font-semibold" style={{ color: 'var(--accent)' }}>{skipDup ? dedup.filtered.length : previewData.cards.length}</span>
            </div>
            {dedup.count > 0 && (
              <div className="inline-flex p-0.5 rounded-lg" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-soft)' }}>
                <button onClick={() => setSkipDup(true)}
                  className={`flex-1 py-[7px] px-2.5 text-[12px] font-medium rounded-md transition-all ${skipDup ? 'bg-bg-card text-ink shadow-sm' : 'text-ink-2'}`}>
                  跳过重复
                </button>
                <button onClick={() => setSkipDup(false)}
                  className={`flex-1 py-[7px] px-2.5 text-[12px] font-medium rounded-md transition-all ${!skipDup ? 'bg-bg-card text-ink shadow-sm' : 'text-ink-2'}`}>
                  全部导入
                </button>
              </div>
            )}
          </div>

          <div className="bg-bg-card rounded-md p-4 flex flex-col gap-2.5" style={{ border: '1px solid var(--border-soft)' }}>
            <div className="font-zh text-sm font-medium text-ink">卡片预览</div>
            <div className="flex flex-col gap-1.5">
              {previewData.cards.slice(0, 5).map((card, i) => (
                <div key={i} className="flex gap-2 py-[7px] px-2.5 rounded-md font-zh text-xs text-ink"
                  style={{ borderLeft: '2px solid var(--accent-line)', background: 'var(--bg)' }}>
                  <span className="font-mono text-[10px] text-ink-3 min-w-[18px]">{String(i+1).padStart(2,'0')}</span>
                  {card.front}
                </div>
              ))}
              {previewData.cards.length > 5 && (
                <div className="flex gap-2 py-[7px] px-2.5 rounded-md font-mono text-[11px] text-ink-3"
                  style={{ borderLeft: '2px solid var(--border)', background: 'var(--bg)' }}>
                  <span className="min-w-[18px]">···</span>还有 {previewData.cards.length - 5} 张
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleCancelImport}
              className="inline-flex items-center justify-center py-2.5 rounded-md font-body text-sm text-ink-2 border active:scale-[0.97] transition-transform"
              style={{ borderColor: 'var(--border)' }}>
              取消
            </button>
            <button onClick={handleConfirmImport}
              className="inline-flex items-center justify-center py-2.5 rounded-md font-body text-sm font-medium bg-ink text-bg active:scale-[0.97] transition-transform">
              确认导入
            </button>
          </div>
        </main>
      </div>
    )
  }

  // Import mode
  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <header className="sticky top-0 z-10 flex items-center px-[18px] h-[52px] bg-bg border-b" style={{ borderColor: 'var(--border-soft)' }}>
        <button onClick={() => navigate(-1)} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-bg-raised hover:text-ink transition-colors">
          <BackIcon />
        </button>
        <h1 className="flex-1 font-zh text-[17px] font-medium text-ink pl-1">导入</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-[18px] flex flex-col gap-4">
        <div className="bg-bg-card rounded-md p-4 flex flex-col gap-2.5" style={{ border: '1px solid var(--border-soft)' }}>
          <div className="font-zh text-sm font-medium text-ink">从文件导入</div>
          <div onClick={() => fileInputRef.current?.click()}
            className="border-dashed rounded-md py-[22px] px-4 text-center flex flex-col items-center gap-2.5 cursor-pointer transition-colors hover:border-accent-line"
            style={{ border: '1.5px dashed var(--border)', background: 'var(--bg)' }}>
            <div className="w-9 h-9 rounded-full bg-bg-card flex items-center justify-center text-ink-2" style={{ border: '1px solid var(--border)' }}>
              <UploadIcon size={18} />
            </div>
            <div className="font-zh text-[13px] text-ink">点击选择 · 或拖入文件</div>
            <div className="font-mono text-[10px] text-ink-3 tracking-wider">.MD &nbsp; .JSON</div>
          </div>
        </div>

        <div className="bg-bg-card rounded-md p-4 flex flex-col gap-2.5" style={{ border: '1px solid var(--border-soft)' }}>
          <div className="font-zh text-sm font-medium text-ink">粘贴 Markdown</div>
          <textarea value={pasteMd} onChange={(e) => setPasteMd(e.target.value)}
            placeholder="# 章节&#10;## 小节&#10;- 正面&#10;  - 背面"
            className="w-full min-h-[110px] bg-bg rounded-lg px-3 py-2.5 text-[13px] font-zh outline-none resize-none focus:border-accent"
            style={{ border: '1px solid var(--border)' }} />
          <button onClick={handlePasteSubmit} disabled={!pasteMd.trim()}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-md font-body text-sm font-medium active:scale-[0.97] transition-transform disabled:opacity-40"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent-line)' }}>
            <PasteIcon size={16} /> 解析并预览
          </button>
        </div>

        <div className="text-center text-[11px] text-ink-3 font-mono tracking-wider mt-1">
          不知如何准备内容？ <Link to="/prompt-guide" className="text-accent hover:underline">查看制卡指南 →</Link>
        </div>
      </main>

      <input ref={fileInputRef} type="file" accept=".md,.json" onChange={handleFileSelected} className="hidden" />
    </div>
  )
}
