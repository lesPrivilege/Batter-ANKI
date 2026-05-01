import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import StatsBar from '../components/StatsBar'
import { getAllDeckStats } from '../lib/scheduler'
import { addDeck, addCard, importData, deleteDecks, loadData } from '../lib/storage'
import { parseMdToCards } from '../lib/mdParser'

export default function Home() {
  const [decks, setDecks] = useState([])
  const [showNewDeck, setShowNewDeck] = useState(false)
  const [newDeckName, setNewDeckName] = useState('')
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState(new Set())

  const refresh = () => setDecks(getAllDeckStats())
  useEffect(refresh, [])

  const handleAddDeck = (e) => {
    e.preventDefault()
    if (!newDeckName.trim()) return
    addDeck(newDeckName.trim())
    setNewDeckName('')
    setShowNewDeck(false)
    refresh()
  }

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBatchDelete = () => {
    if (selected.size === 0) return
    if (!confirm(`Delete ${selected.size} deck(s) and all their cards?`)) return
    deleteDecks([...selected])
    setSelected(new Set())
    setEditing(false)
    refresh()
  }

  const exitEdit = () => {
    setEditing(false)
    setSelected(new Set())
  }

  const unifiedFileInputRef = useRef(null)

  const handleUnifiedImport = () => {
    unifiedFileInputRef.current?.click()
  }

  const handleUnifiedFileSelected = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ext === 'json') {
        try {
          importData(ev.target.result)
          refresh()
        } catch {
          alert('Import failed: invalid JSON format')
        }
      } else if (ext === 'md') {
        processMdContent(ev.target.result, file.name.replace(/\.md$/i, ''))
      } else {
        alert('Unsupported file type. Please select .json or .md')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const [showPasteMd, setShowPasteMd] = useState(false)
  const [pasteMdText, setPasteMdText] = useState('')
  const pasteTextareaRef = useRef(null)

  const handlePasteMdSubmit = () => {
    if (!pasteMdText.trim()) return
    processMdContent(pasteMdText, 'Pasted Notes')
    setPasteMdText('')
    setShowPasteMd(false)
  }

  const processMdContent = (mdContent, defaultDeckName) => {
    const cards = parseMdToCards(mdContent, defaultDeckName)
    if (cards.length === 0) {
      alert('未识别到卡片。请确认 .md 格式是否符合格式要求。')
      window.location.hash = '#/prompt-guide'
      return
    }
    const deckName = prompt(`Import ${cards.length} card(s). Enter deck name:`, defaultDeckName)
    if (deckName === null) return
    const name = deckName.trim() || defaultDeckName
    const deck = addDeck(name)
    for (const card of cards) {
      addCard(deck.id, card.front, card.back, card.type, card.chapter, card.section)
    }
    refresh()
  }

  const [dark, setDark] = useState(() => {
    return localStorage.getItem('mini-srs-theme') === 'dark' ||
      (!localStorage.getItem('mini-srs-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('mini-srs-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 h-12
        bg-bg-card border-b border-border shrink-0">
        <h1 className="text-lg font-serif font-bold text-ink">Mnemos</h1>
        <div className="flex items-center gap-3">
          {editing ? (
            <button onClick={exitEdit} className="text-sm text-ink-2 active:scale-[0.97]">
              Done
            </button>
          ) : (
            <>
              <button
                onClick={() => setDark(!dark)}
                className="text-sm text-ink-2 active:scale-[0.97] transition-transform"
              >
                {dark ? '\u2600' : '\u263E'}
              </button>
              {decks.length > 0 && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm text-ink-2 active:scale-[0.97]"
                >
                  Edit
                </button>
              )}
            </>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto max-w-[480px] w-full mx-auto">
        {/* Stats — hidden in edit mode */}
        {!editing && (
          <div className="px-4 pt-4">
            <StatsBar stats={{
              reviewedToday: decks.reduce((sum, d) => sum + d.reviewedToday, 0),
              dueCount: decks.reduce((sum, d) => sum + d.dueCount, 0),
              total: decks.reduce((sum, d) => sum + d.totalCards, 0),
              futureDistribution: (() => {
                const data = loadData()
                const allRecall = data.cards.filter(c => (c.type || 'recall') === 'recall')
                const dist = []
                for (let i = 1; i <= 7; i++) {
                  const d = new Date()
                  d.setDate(d.getDate() + i)
                  const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
                  dist.push({ date: ds, count: allRecall.filter(c => c.dueDate === ds).length })
                }
                return dist
              })(),
            }} />
          </div>
        )}

        {/* Deck list */}
        <div className="px-4 pt-4 space-y-2">
          {decks.length === 0 ? (
            <div className="py-12 text-center">
              <span className="text-sm text-ink-2">No decks yet.</span>
            </div>
          ) : (
            decks.map((deck) => (
              editing ? (
                <button
                  key={deck.id}
                  onClick={() => toggleSelect(deck.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border bg-bg-card
                    transition-colors text-left
                    ${selected.has(deck.id) ? 'border-accent bg-accent/5' : 'border-border'}`}
                >
                  <div className={`w-5 h-5 rounded border shrink-0 flex items-center justify-center
                    ${selected.has(deck.id) ? 'bg-accent border-accent' : 'border-border'}`}>
                    {selected.has(deck.id) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-ui font-medium text-ink truncate">{deck.name}</div>
                    <div className="text-sm text-ink-2 mt-1">
                      {deck.dueCount} due &middot; {deck.totalCards} total
                    </div>
                  </div>
                </button>
              ) : (
                <Link
                  key={deck.id}
                  to={`/deck/${deck.id}`}
                  className="flex justify-between items-center p-4 rounded-lg border border-border bg-bg-card
                    active:bg-bg-raised transition-colors"
                >
                  <div>
                    <div className="text-base font-ui font-medium text-ink">{deck.name}</div>
                    <div className="text-sm text-ink-2 mt-1">
                      {deck.dueCount} due &middot; {deck.totalCards} total
                    </div>
                  </div>
                  <span className="text-ink-2 text-sm shrink-0 ml-2">→</span>
                </Link>
              )
            ))
          )}
        </div>

        {/* Batch delete bar — edit mode only */}
        {editing && (
          <div className="px-4 pt-4 flex gap-2">
            {selected.size > 0 && (
              <button
                onClick={handleBatchDelete}
                className="flex-1 py-2.5 rounded-lg font-ui text-sm text-danger
                  border border-danger/30 active:scale-[0.97] transition-transform"
              >
                Delete ({selected.size})
              </button>
            )}
            <button
              onClick={() => {
                if (!confirm(`Delete ALL ${decks.length} decks and all their cards?`)) return
                deleteDecks(decks.map((d) => d.id))
                setSelected(new Set())
                setEditing(false)
                refresh()
              }}
              className="flex-1 py-2.5 rounded-lg font-ui text-sm text-danger
                border border-danger/30 active:scale-[0.97] transition-transform"
            >
              Delete All
            </button>
          </div>
        )}

        {/* Bottom actions — hidden in edit mode */}
        {!editing && (
          <>
            {/* Import button */}
            <div className="px-4 pt-4">
              <button
                onClick={handleUnifiedImport}
                className="w-full py-2.5 rounded-lg font-ui text-sm text-ink-2
                  border border-border active:scale-[0.97] transition-transform"
              >
                Import
              </button>
            </div>

            {/* Paste .md button */}
            <div className="px-4 pt-2">
              <button
                onClick={() => setShowPasteMd(!showPasteMd)}
                className="w-full py-2.5 rounded-lg font-ui text-sm text-ink-2
                  border border-border active:scale-[0.97] transition-transform"
              >
                {showPasteMd ? 'Cancel' : 'Paste'}
              </button>
            </div>

            {showPasteMd && (
              <div className="px-4 pt-2">
                <p className="text-xs text-ink-2 mb-1.5">
                  粘贴符合格式的 markdown · <Link to="/prompt-guide" className="text-accent">查看格式说明</Link>
                </p>
                <textarea
                  ref={pasteTextareaRef}
                  value={pasteMdText}
                  onChange={(e) => setPasteMdText(e.target.value)}
                  placeholder="Paste your structured markdown here..."
                  className="w-full h-40 px-3 py-2.5 rounded-lg border border-border bg-bg-card text-ink
                    font-ui text-sm placeholder:text-ink-2/50 resize-none
                    focus:outline-none focus:border-accent"
                  autoFocus
                />
                <button
                  onClick={handlePasteMdSubmit}
                  disabled={!pasteMdText.trim()}
                  className="w-full mt-2 py-2.5 rounded-lg font-ui text-sm font-medium text-accent
                    border border-accent active:scale-[0.97] transition-transform
                    disabled:opacity-40"
                >
                  Parse & Import
                </button>
              </div>
            )}

            {/* + New Deck button */}
            <div className="px-4 pb-4 pt-2">
              {showNewDeck ? (
                <form onSubmit={handleAddDeck} className="flex gap-2">
                  <input
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    placeholder="Deck name"
                    autoFocus
                    className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-bg-card text-ink
                      font-ui text-sm placeholder:text-ink-2/50
                      focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-lg font-medium text-sm font-ui
                      border border-accent text-accent
                      active:scale-[0.97] transition-transform
                      disabled:opacity-40"
                    disabled={!newDeckName.trim()}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowNewDeck(false); setNewDeckName('') }}
                    className="px-4 py-2.5 rounded-lg font-ui text-sm
                      border border-border text-ink-2
                      active:scale-[0.97] transition-transform"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowNewDeck(true)}
                  className="w-full py-3 rounded-lg font-ui text-base font-medium text-accent
                    border border-border active:scale-[0.97] transition-transform"
                >
                  + New Deck
                </button>
              )}
            </div>
          </>
        )}
      </main>

      <input
        ref={unifiedFileInputRef}
        type="file"
        accept=".json,.md"
        onChange={handleUnifiedFileSelected}
        className="hidden"
      />
    </div>
  )
}
