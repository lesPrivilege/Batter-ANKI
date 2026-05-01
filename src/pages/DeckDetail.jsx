import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import CardEditor from '../components/CardEditor'
import { BackIcon, PinIcon, MoreIcon, LayersIcon, SparkIcon, UploadIcon, PlusIcon, SearchIcon, EditIcon, TrashIcon } from '../components/Icons'
import { isRecall } from '../lib/cardUtils'
import { localToday } from '../lib/dateUtils'
import { getDeck, getCards, addCard, updateCard, updateDeck, deleteCard, deleteCards, deleteDeck, togglePin, toggleStar } from '../lib/storage'

function buildOutline(cards) {
  const map = new Map()
  for (const card of cards) {
    const ch = card.chapter || ''
    if (!map.has(ch)) map.set(ch, new Map())
    const secMap = map.get(ch)
    const sec = card.section || ''
    if (!secMap.has(sec)) secMap.set(sec, [])
    secMap.get(sec).push(card)
  }
  return map
}

export default function DeckDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [showEditor, setShowEditor] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [expandedChapters, setExpandedChapters] = useState(new Set())
  const [expandedSections, setExpandedSections] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [showDeckMenu, setShowDeckMenu] = useState(false)

  const refresh = () => {
    setDeck(getDeck(id))
    setCards(getCards(id))
  }

  useEffect(refresh, [id])

  const filteredCards = useMemo(() => {
    if (filter === 'starred') return cards.filter(c => c.starred)
    if (filter === 'ref') return cards.filter(c => !isRecall(c))
    return cards
  }, [cards, filter])

  const outline = useMemo(() => buildOutline(filteredCards), [filteredCards])

  const toggleChapter = (ch) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev)
      if (next.has(ch)) next.delete(ch)
      else next.add(ch)
      return next
    })
  }

  const toggleSection = (key) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleAdd = (front, back) => {
    addCard(id, front, back)
    setShowEditor(false)
    refresh()
  }

  const handleEdit = (front, back) => {
    updateCard(editingCard.id, { front, back })
    setEditingCard(null)
    refresh()
  }

  const handleDelete = (cardId) => {
    deleteCard(cardId)
    refresh()
  }

  const handleDeleteDeck = () => {
    if (confirm('Delete this deck and all cards?')) {
      deleteDeck(id)
      navigate('/')
    }
  }

  const toggleSelect = (cardId) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(cardId)) next.delete(cardId)
      else next.add(cardId)
      return next
    })
  }

  const handleBatchDelete = () => {
    if (selected.size === 0) return
    if (!confirm(`Delete ${selected.size} card(s)?`)) return
    deleteCards([...selected])
    setSelected(new Set())
    setEditing(false)
    refresh()
  }

  const exitEdit = () => {
    setEditing(false)
    setSelected(new Set())
  }

  const recallCards = cards.filter(c => isRecall(c))
  const t = localToday()
  const dueCount = recallCards.filter(c => c.dueDate <= t).length
  const total = recallCards.length
  const learned = total - dueCount

  if (!deck) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg text-ink-2">
        Deck not found
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-[18px] h-[52px]
        bg-bg border-b" style={{ borderColor: 'var(--border-soft)' }}>
        <button onClick={() => navigate(-1)} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-bg-raised hover:text-ink transition-colors">
          <BackIcon />
        </button>
        {editingName ? (
          <input autoFocus type="text" value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={() => {
              const trimmed = nameInput.trim()
              if (trimmed && trimmed !== deck.name) { updateDeck(id, trimmed) }
              setEditingName(false)
              refresh()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.target.blur()
              else if (e.key === 'Escape') { setEditingName(false) }
            }}
            className="flex-1 font-zh text-[17px] font-medium text-ink bg-transparent border-b border-accent outline-none px-2" />
        ) : (
          <h1 onClick={() => { setEditingName(true); setNameInput(deck.name) }}
            className="flex-1 font-zh text-[17px] font-medium text-ink truncate cursor-pointer hover:text-accent transition-colors pl-1">
            {deck.name}
          </h1>
        )}
        <div className="flex gap-1 items-center">
          <button onClick={() => { togglePin(id); refresh() }}
            className={`w-8 h-8 inline-flex items-center justify-center rounded-lg transition-colors ${deck.pinned ? 'text-accent' : 'text-ink-3'} hover:bg-bg-raised`}>
            <PinIcon />
          </button>
          <div className="relative">
            <button onClick={() => setShowDeckMenu((open) => !open)}
              className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-ink-3 hover:bg-bg-raised hover:text-ink transition-colors"
              aria-haspopup="menu"
              aria-expanded={showDeckMenu}>
              <MoreIcon />
            </button>
            {showDeckMenu && (
              <>
                <button className="fixed inset-0 z-10 cursor-default" onClick={() => setShowDeckMenu(false)} aria-label="Close menu" />
                <div className="absolute right-0 top-9 z-20 min-w-[168px] rounded-md bg-bg-card shadow-lg overflow-hidden"
                  role="menu"
                  style={{ border: '1px solid var(--border-soft)' }}>
                  <button onClick={() => {
                    setShowDeckMenu(false)
                    setEditingName(true)
                    setNameInput(deck.name)
                  }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-body text-ink-2 hover:bg-bg-raised hover:text-ink transition-colors"
                    role="menuitem">
                    <EditIcon size={15} /> 重命名卡组
                  </button>
                  <button onClick={() => {
                    setShowDeckMenu(false)
                    togglePin(id)
                    refresh()
                  }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-body text-ink-2 hover:bg-bg-raised hover:text-ink transition-colors"
                    role="menuitem">
                    <PinIcon size={15} /> {deck.pinned ? '取消置顶' : '置顶卡组'}
                  </button>
                  <button onClick={() => {
                    setShowDeckMenu(false)
                    editing ? exitEdit() : setEditing(true)
                  }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-body text-ink-2 hover:bg-bg-raised hover:text-ink transition-colors"
                    role="menuitem">
                    <EditIcon size={15} /> {editing ? '完成编辑' : '批量编辑卡片'}
                  </button>
                  <button onClick={() => {
                    setShowDeckMenu(false)
                    handleDeleteDeck()
                  }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-body text-danger hover:bg-bg-raised transition-colors"
                    role="menuitem">
                    <TrashIcon size={15} /> 删除卡组
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Title block + progress */}
        <div className="p-[18px] pb-2 flex flex-col gap-1.5">
          <div className="font-mono text-[11px] text-ink-3 tracking-wide flex items-center gap-2">
            <span>{total} 张</span>
            <span className="text-ink-4">/</span>
            <span style={{ color: 'var(--accent)' }}>{dueCount} 待复习</span>
            <span className="text-ink-4">/</span>
            <span>{learned} 已学</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
            <div className="h-full rounded-full" style={{ background: 'var(--accent)', width: `${total > 0 ? (learned/total)*100 : 0}%` }} />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] text-ink-3">
            <span>PROGRESS</span>
            <span>{total > 0 ? Math.round((learned/total)*100) : 0}%</span>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="px-[18px] mt-1">
          <Link to={`/review/${id}`}
            className="flex items-center justify-between p-3.5 px-4 rounded-md bg-ink text-bg shadow-md">
            <div className="flex flex-col items-start gap-0.5">
              <div className="font-display text-[22px] leading-none">
                <span className="font-mono font-medium text-[18px] mr-1.5">{dueCount}</span> 张待复习
              </div>
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase opacity-60">START REVIEW</div>
            </div>
            <span className="font-mono text-[22px]">→</span>
          </Link>
        </div>

        {/* Secondary actions — 4-up grid */}
        <div className="mx-[18px] mt-2 grid grid-cols-4 gap-1.5 p-1.5 rounded-md bg-bg-card"
          style={{ border: '1px solid var(--border-soft)' }}>
          <Link to={`/browse/${id}`} className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg text-ink-2 hover:bg-bg-raised hover:text-ink transition-colors">
            <LayersIcon size={18} /><span className="text-[10px] font-medium font-body">浏览</span>
          </Link>
          <Link to={`/review/${id}?all=true`} className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg text-ink-2 hover:bg-bg-raised hover:text-ink transition-colors">
            <SparkIcon size={18} /><span className="text-[10px] font-medium font-body">全部复习</span>
          </Link>
          <Link to={`/import?deckId=${id}`} className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg text-ink-2 hover:bg-bg-raised hover:text-ink transition-colors">
            <UploadIcon size={18} /><span className="text-[10px] font-medium font-body">导入</span>
          </Link>
          <button onClick={() => setShowEditor(!showEditor)} className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg text-ink-2 hover:bg-bg-raised hover:text-ink transition-colors">
            <PlusIcon size={18} /><span className="text-[10px] font-medium font-body">新卡片</span>
          </button>
        </div>

        {/* Editor */}
        {showEditor && (
          <div className="mx-[18px] mt-2 p-4 rounded-md border bg-bg-card" style={{ borderColor: 'var(--border-soft)' }}>
            <CardEditor onSave={handleAdd} onCancel={() => setShowEditor(false)} />
          </div>
        )}

        {/* Filter chips */}
        <div className="mx-[18px] mt-3 flex gap-1.5 items-center">
          <button onClick={() => setFilter('all')}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[12px] font-body transition-all
              ${filter === 'all' ? 'bg-ink text-bg border-ink' : 'bg-bg-card text-ink-2 hover:border-border-strong hover:text-ink'}`}
            style={{ borderColor: filter === 'all' ? undefined : 'var(--border)' }}>
            全部 · {total}
          </button>
          <button onClick={() => setFilter('starred')}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[12px] font-body transition-all
              ${filter === 'starred' ? 'bg-ink text-bg border-ink' : 'bg-bg-card text-ink-2 hover:border-border-strong hover:text-ink'}`}
            style={{ borderColor: filter === 'starred' ? undefined : 'var(--border)' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l2.7 5.9 6.3.6-4.8 4.5 1.5 6.5L12 17l-5.7 3.5 1.5-6.5L3 9.5l6.3-.6z"/></svg>
            收藏
          </button>
          <button onClick={() => setFilter('ref')}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[12px] font-body transition-all
              ${filter === 'ref' ? 'bg-ink text-bg border-ink' : 'bg-bg-card text-ink-2 hover:border-border-strong hover:text-ink'}`}
            style={{ borderColor: filter === 'ref' ? undefined : 'var(--border)' }}>
            参考
          </button>
        </div>

        {/* Search */}
        <div className="mx-[18px] mt-2 relative">
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索卡片..."
            className="w-full py-[9px] px-3 bg-bg-card rounded-md text-[13px] outline-none transition-colors focus:border-accent"
            style={{ border: '1px solid var(--border)', paddingLeft: 36 }} />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 flex items-center">
            <SearchIcon size={16} />
          </div>
        </div>

        {/* Outline */}
        <div className="mx-[18px] my-2 mb-6 flex flex-col gap-px">
          {searchQuery.trim() ? (
            filteredCards
              .filter(c => {
                const q = searchQuery.toLowerCase()
                return c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q)
              })
              .map(card => (
                <div key={card.id} className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-bg-raised font-zh text-[13px] text-ink relative"
                  style={{ paddingLeft: 40 }}>
                  <div className="absolute left-[28px] top-1/2 w-1.5 h-px" style={{ background: 'var(--ink-4)' }} />
                  <span className="flex-1 truncate">{card.front}</span>
                  {card.starred && <span className="text-accent text-[11px] shrink-0">★</span>}
                  {!isRecall(card) && <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border text-ink-3 shrink-0" style={{ borderColor: 'var(--border)' }}>REF</span>}
                </div>
              ))
          ) : (
            [...outline.entries()].map(([chapter, secMap]) => {
              const chapterKey = chapter || '__uncategorized__'
              const chapterCount = [...secMap.values()].reduce((sum, arr) => sum + arr.length, 0)
              const isChapterOpen = expandedChapters.has(chapterKey)

              return (
                <div key={chapterKey}>
                  <div onClick={() => toggleChapter(chapterKey)}
                    className="flex items-center gap-2 py-2 px-1 rounded-md cursor-pointer hover:bg-bg-raised transition-colors">
                    <span className={`w-4 h-4 inline-flex items-center justify-center text-ink-3 font-mono text-[10px] transition-transform ${isChapterOpen ? 'rotate-90' : ''}`}>›</span>
                    <span className="font-zh text-sm font-medium text-ink flex-1">{chapter || '未分类'}</span>
                    <span className="font-mono text-[10px] text-ink-3">{chapterCount}</span>
                  </div>
                  {isChapterOpen && (
                    <div className="ml-5">
                      {[...secMap.entries()].map(([section, sectionCards]) => {
                        const sectionKey = `${chapterKey}::${section}`
                        const isSectionOpen = expandedSections.has(sectionKey)
                        if (!section) {
                          return (
                            <div key={sectionKey} className="ml-4">
                              {sectionCards.map((card) => (
                                <CardRow key={card.id} card={card} editing={editing} selected={selected.has(card.id)}
                                  onToggleSelect={() => toggleSelect(card.id)}
                                  onEdit={() => setEditingCard(card)} onDelete={() => handleDelete(card.id)}
                                  isEditingThis={editingCard?.id === card.id} onSave={handleEdit} onCancel={() => setEditingCard(null)} />
                              ))}
                            </div>
                          )
                        }
                        return (
                          <div key={sectionKey}>
                            <div onClick={() => toggleSection(sectionKey)}
                              className="flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-bg-raised transition-colors">
                              <span className={`w-4 h-4 inline-flex items-center justify-center text-ink-3 font-mono text-[10px] transition-transform ${isSectionOpen ? 'rotate-90' : ''}`}>›</span>
                              <span className="font-zh text-[13px] text-ink-2 flex-1">{section}</span>
                              <span className="font-mono text-[10px] text-ink-3">{sectionCards.length}</span>
                            </div>
                            {isSectionOpen && (
                              <div className="ml-4">
                                {sectionCards.map((card) => (
                                  <CardRow key={card.id} card={card} editing={editing} selected={selected.has(card.id)}
                                    onToggleSelect={() => toggleSelect(card.id)}
                                    onEdit={() => setEditingCard(card)} onDelete={() => handleDelete(card.id)}
                                    isEditingThis={editingCard?.id === card.id} onSave={handleEdit} onCancel={() => setEditingCard(null)} />
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Edit mode batch delete */}
        {editing && (
          <div className="mx-[18px] mb-4 flex gap-2">
            {selected.size > 0 && (
              <button onClick={handleBatchDelete}
                className="flex-1 py-2.5 rounded-md font-body text-sm text-danger border active:scale-[0.97] transition-transform"
                style={{ borderColor: 'color-mix(in oklch, var(--danger) 30%, transparent)' }}>
                Delete ({selected.size})
              </button>
            )}
            <button onClick={() => {
              if (!confirm(`Delete ALL ${cards.length} cards in this deck?`)) return
              deleteCards(cards.map((c) => c.id))
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
      </main>
    </div>
  )
}

function CardRow({ card, editing, selected, onToggleSelect, onEdit, onDelete, isEditingThis, onSave, onCancel }) {
  if (isEditingThis) {
    return (
      <div className="p-2 rounded-lg border border-accent bg-accent/5">
        <CardEditor initial={card} onSave={onSave} onCancel={onCancel} />
      </div>
    )
  }

  if (editing) {
    return (
      <div onClick={onToggleSelect}
        className={`flex items-center gap-2 py-2 px-2 rounded-md cursor-pointer transition-colors
          ${selected ? 'bg-accent/5 border border-accent' : 'border hover:bg-bg-raised'}`}
        style={{ borderColor: selected ? undefined : 'var(--border)' }}>
        <div className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center
          ${selected ? 'bg-accent border-accent' : 'border-border'}`}>
          {selected && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-sm text-ink truncate flex-1">{card.front}</span>
        {card.starred && <span className="text-xs shrink-0 text-accent">★</span>}
        {!isRecall(card) && (
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border text-ink-3 shrink-0" style={{ borderColor: 'var(--border)' }}>REF</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-bg-raised transition-colors group font-zh text-[13px] text-ink relative"
      style={{ paddingLeft: 40 }}>
      <div className="absolute left-[28px] top-1/2 w-1.5 h-px" style={{ background: 'var(--ink-4)' }} />
      <span className="flex-1 truncate">{card.front}</span>
      {card.starred && <span className="text-accent text-[11px] shrink-0">★</span>}
      {!isRecall(card) && (
        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border text-ink-3 shrink-0" style={{ borderColor: 'var(--border)' }}>REF</span>
      )}
      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="text-[11px] px-1.5 py-0.5 rounded border text-ink-2" style={{ borderColor: 'var(--border)' }}>Edit</button>
        <button onClick={onDelete} className="text-[11px] px-1.5 py-0.5 rounded border text-danger" style={{ borderColor: 'color-mix(in oklch, var(--danger) 30%, transparent)' }}>Del</button>
      </div>
    </div>
  )
}
