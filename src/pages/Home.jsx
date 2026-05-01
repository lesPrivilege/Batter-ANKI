import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StatsBar from '../components/StatsBar'
import { MnemosMark, SettingsIcon, PlusIcon, UploadIcon, CheckIcon } from '../components/Icons'
import { getAllDeckStats } from '../lib/scheduler'
import { addDeck, deleteDecks, getDailyLimit, togglePin } from '../lib/storage'

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

  const navigate = useNavigate()
  const sorted = [...decks].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
  const futureDistribution = decks.reduce((merged, deck) => {
    if (merged.length === 0) {
      return deck.futureDistribution.map((d) => ({ ...d }))
    }
    return merged.map((d, i) => ({
      ...d,
      count: d.count + (deck.futureDistribution[i]?.count || 0),
    }))
  }, [])
  const dailyLimit = getDailyLimit()

  const DECK_COLORS = ['h0', 'h1', 'h2', 'h3']

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Topbar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-[18px] h-[52px]
        bg-bg border-b" style={{ borderColor: 'var(--border-soft)' }}>
        <h1 className="font-display italic text-[22px] tracking-tight text-ink flex items-center gap-2.5">
          <MnemosMark size={20} accent="var(--accent)" />Mnemos
        </h1>
        <div className="flex gap-1 items-center">
          {editing ? (
            <button onClick={exitEdit} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-bg-raised hover:text-ink transition-colors text-sm">
              Done
            </button>
          ) : (
            <>
              {decks.length > 0 && (
                <button onClick={() => setEditing(true)} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-bg-raised hover:text-ink transition-colors text-sm">
                  Edit
                </button>
              )}
              <button onClick={() => navigate('/settings')} className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-bg-raised hover:text-ink transition-colors" aria-label="Settings">
                <SettingsIcon size={18} />
              </button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="p-[18px] pb-8 flex flex-col gap-4">
          {/* Stats — hidden in edit mode */}
          {!editing && (
            <StatsBar stats={{
              reviewedToday: decks.reduce((sum, d) => sum + d.reviewedToday, 0),
              dueCount: decks.reduce((sum, d) => sum + d.dueCount, 0),
              total: decks.reduce((sum, d) => sum + d.totalCards, 0),
              futureDistribution,
              dailyLimit,
            }} />
          )}

          {/* Decks section header */}
          <div className="flex items-center justify-between px-1">
            <div className="font-mono text-[10px] tracking-[0.18em] text-ink-3 uppercase flex items-center gap-2">
              卡组 · DECKS
              <span className="flex-1 h-px" style={{ background: 'var(--border-soft)' }} />
            </div>
            <span className="font-mono text-[11px] text-ink-3">{decks.length}</span>
          </div>

          {/* Deck list */}
          {decks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12 text-center text-ink-3">
              <MnemosMark size={56} color="var(--ink-4)" accent="var(--ink-4)" />
              <div className="font-display text-[26px] text-ink-2 mt-2">
                <em>memoria principium</em>
              </div>
              <div className="font-zh text-sm">记忆是一切的开端</div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sorted.map((deck) => {
                const hueClass = DECK_COLORS[Math.abs(deck.name.charCodeAt(0)) % 4]
                const glyph = deck.name.charAt(0)
                return editing ? (
                  <button key={deck.id} onClick={() => toggleSelect(deck.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-md transition-colors text-left
                      ${selected.has(deck.id)
                        ? 'bg-accent/5 border border-accent'
                        : 'bg-bg-card border'}`}
                    style={{ borderColor: selected.has(deck.id) ? undefined : 'var(--border-soft)' }}>
                    <div className={`w-5 h-5 rounded border shrink-0 flex items-center justify-center
                      ${selected.has(deck.id) ? 'bg-accent border-accent' : 'border-border'}`}>
                      {selected.has(deck.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-zh text-[15px] font-medium text-ink truncate">{deck.name}</div>
                      <div className="font-mono text-[11px] text-ink-3 mt-1">
                        {deck.dueCount} due · {deck.totalCards} total
                      </div>
                    </div>
                  </button>
                ) : (
                  <Link key={deck.id} to={`/deck/${deck.id}`}
                    className="bg-bg-card grid grid-cols-[56px_1fr_auto] items-center gap-3 cursor-pointer transition-all hover:border-border active:scale-[0.99] rounded-md p-0 pr-3.5 shadow-sm"
                    style={{ border: '1px solid var(--border-soft)' }}>
                    <div className={`deck-spine ${hueClass} h-14 ml-3.5 rounded relative overflow-hidden`}
                      style={{ position: 'relative' }}>
                      <div className="absolute inset-0 flex items-center justify-center font-zh text-[26px] text-ink-2 font-medium pl-1.5">{glyph}</div>
                    </div>
                    <div className="min-w-0 py-3.5">
                      <div className="font-zh text-[15px] font-medium text-ink truncate flex items-center gap-1.5">
                        {deck.name}
                        {deck.pinned && <span className="text-accent text-[10px]">◆</span>}
                      </div>
                      <div className="font-mono text-[11px] text-ink-3 mt-1 flex items-center gap-1.5">
                        {deck.dueCount > 0
                          ? <><span className="text-accent font-semibold">{deck.dueCount}</span><span>待复习</span></>
                          : <span style={{ color: 'var(--good)' }}>已完成</span>}
                        <span className="text-ink-4">·</span>
                        <span>{deck.totalCards} 张</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); togglePin(deck.id); refresh() }}
                        className={`w-7 h-7 inline-flex items-center justify-center rounded-md ${deck.pinned ? 'text-accent' : 'text-ink-3'} hover:bg-bg-raised`}
                        title={deck.pinned ? 'Unpin' : 'Pin'}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={deck.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                          <path d="M12 3l3 5 5 1-4 4 1 5-5-3-5 3 1-5-4-4 5-1z" />
                        </svg>
                      </button>
                      {deck.dueCount > 0 ? (
                        <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); navigate(`/review/${deck.id}`) }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-ink text-[11px] font-medium font-body tracking-wide whitespace-nowrap"
                          style={{ background: 'var(--ink)' }}>
                          <span style={{ color: 'var(--bg)' }}>复习</span>
                          <span className="font-mono text-[12px]" style={{ color: 'var(--bg)' }}>→</span>
                        </button>
                      ) : (
                        <span className="w-[26px] h-[26px] rounded-full inline-flex items-center justify-center text-[12px]"
                          style={{ background: 'var(--good-soft)', color: 'var(--good)' }}>
                          <CheckIcon size={14} />
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Edit mode batch delete */}
          {editing && (
            <div className="flex gap-2 mt-2">
              {selected.size > 0 && (
                <button onClick={handleBatchDelete}
                  className="flex-1 py-2.5 rounded-md font-body text-sm text-danger border active:scale-[0.97] transition-transform"
                  style={{ borderColor: 'color-mix(in oklch, var(--danger) 30%, transparent)' }}>
                  Delete ({selected.size})
                </button>
              )}
              <button onClick={() => {
                if (!confirm(`Delete ALL ${decks.length} decks and all their cards?`)) return
                deleteDecks(decks.map((d) => d.id))
                setSelected(new Set())
                setEditing(false)
                refresh()
              }}
                className="flex-1 py-2.5 rounded-md font-body text-sm text-danger border active:scale-[0.97] transition-transform"
                style={{ borderColor: 'color-mix(in oklch, var(--danger) 30%, transparent)' }}>
                Delete All
              </button>
            </div>
          )}

          {/* Bottom actions — hidden in edit mode */}
          {!editing && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {showNewDeck ? (
                <form onSubmit={handleAddDeck} className="col-span-2 flex gap-2">
                  <input value={newDeckName} onChange={(e) => setNewDeckName(e.target.value)}
                    placeholder="Deck name" autoFocus
                    className="flex-1 px-3 py-2.5 rounded-md border bg-bg-card text-ink font-body text-sm placeholder:text-ink-3 focus:outline-none focus:border-accent"
                    style={{ borderColor: 'var(--border)' }} />
                  <button type="submit" disabled={!newDeckName.trim()}
                    className="px-4 py-2.5 rounded-md font-medium text-sm font-body bg-ink text-bg active:scale-[0.97] transition-transform disabled:opacity-40">
                    Add
                  </button>
                  <button type="button" onClick={() => { setShowNewDeck(false); setNewDeckName('') }}
                    className="px-4 py-2.5 rounded-md font-body text-sm border text-ink-2 active:scale-[0.97] transition-transform"
                    style={{ borderColor: 'var(--border)' }}>
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <Link to="/import"
                    className="inline-flex items-center justify-center gap-1.5 py-[11px] px-3.5 rounded-md font-body text-[13px] font-medium bg-bg-card border text-ink active:scale-[0.97] transition-transform hover:bg-bg-raised"
                    style={{ borderColor: 'var(--border)' }}>
                    <UploadIcon size={16} /> 导入
                  </Link>
                  <button onClick={() => setShowNewDeck(true)}
                    className="inline-flex items-center justify-center gap-1.5 py-[11px] px-3.5 rounded-md font-body text-[13px] font-medium bg-ink text-bg active:scale-[0.97] transition-transform hover:opacity-80">
                    <PlusIcon size={16} /> 新建卡组
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
